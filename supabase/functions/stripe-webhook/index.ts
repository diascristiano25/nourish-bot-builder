// Receives Stripe webhooks. Public endpoint (verify_jwt = false in config.toml),
// protected by Stripe signature verification instead.
import Stripe from "https://esm.sh/stripe@14.25.0?target=deno";
import { adminClient, PLANS, stripe } from "../_shared/stripe.ts";

const cryptoProvider = Stripe.createSubtleCryptoProvider();
const WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET") ?? "";

const HANDLED = new Set([
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded", // Pix is confirmed asynchronously
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
]);

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const signature = req.headers.get("stripe-signature");
  if (!signature) return new Response("Missing signature", { status: 400 });

  const rawBody = await req.text(); // must be the raw body, not parsed JSON

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      rawBody, signature, WEBHOOK_SECRET, undefined, cryptoProvider,
    );
  } catch (err) {
    console.error("Signature verification failed:", (err as Error).message);
    return new Response("Invalid signature", { status: 400 });
  }

  const admin = adminClient();

  // Idempotency: skip events already processed
  const { error: dupError } = await admin
    .from("stripe_events")
    .insert({ id: event.id, type: event.type });
  if (dupError) {
    // Unique violation => already processed
    if (dupError.code === "23505") return new Response("duplicate", { status: 200 });
    console.error("Could not record event:", dupError.message);
    return new Response("retry", { status: 500 });
  }

  if (!HANDLED.has(event.type)) return new Response("ignored", { status: 200 });

  try {
    if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode === "subscription" && session.customer && session.client_reference_id) {
        await admin.from("stripe_customers").upsert({
          user_id: session.client_reference_id,
          stripe_customer_id: session.customer as string,
        });
      } else if (
        session.mode === "payment" &&
        session.metadata?.kind === "pix_30d" &&
        session.payment_status === "paid"
      ) {
        await grantPixAccess(admin, session);
      }
    } else {
      const sub = event.data.object as Stripe.Subscription;
      await syncSubscription(admin, sub, event.type === "customer.subscription.deleted");
    }
    return new Response("ok", { status: 200 });
  } catch (err) {
    console.error("Processing failed:", (err as Error).message);
    // Allow Stripe to retry: remove the event marker
    await admin.from("stripe_events").delete().eq("id", event.id);
    return new Response("retry", { status: 500 });
  }
});

async function syncSubscription(
  // deno-lint-ignore no-explicit-any
  admin: any,
  eventSub: Stripe.Subscription,
  deleted: boolean,
) {
  // Stripe does not guarantee delivery order. An older event (e.g. "incomplete")
  // can arrive after a newer one ("active"), so always use the current state.
  const sub = await stripe.subscriptions.retrieve(eventSub.id);
  const customerId = sub.customer as string;

  // Resolve the user: metadata first, then the customer mapping
  let userId: string | undefined = sub.metadata?.supabase_user_id;
  if (!userId) {
    const { data } = await admin
      .from("stripe_customers")
      .select("user_id")
      .eq("stripe_customer_id", customerId)
      .maybeSingle();
    userId = data?.user_id;
  }
  if (!userId) throw new Error(`No user for customer ${customerId}`);

  const plan = PLANS.includes(sub.metadata?.plan as never) ? sub.metadata.plan : null;
  if (!plan) throw new Error(`Subscription ${sub.id} has no valid plan metadata`);

  // current_period_end moved between Stripe API versions; read both places
  const periodEnd =
    (sub as unknown as { current_period_end?: number }).current_period_end ??
    sub.items.data[0]?.current_period_end;

  const { error } = await admin.from("subscriptions").upsert(
    {
      user_id: userId,
      stripe_subscription_id: sub.id,
      stripe_customer_id: customerId,
      plan,
      status: deleted ? "canceled" : sub.status,
      current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
      cancel_at_period_end: sub.cancel_at_period_end,
    },
    { onConflict: "stripe_subscription_id" },
  );
  if (error) throw new Error(error.message);

  // A cancelled subscription ends access immediately, even for accounts that had a
  // manual license (account_status = 'active'). Admins are never touched.
  // The account goes back to "trial, already expired"; a new subscription (or an admin
  // extending the trial / re-activating the account) restores access.
  if (deleted || sub.status === "canceled") {
    // Keep access if the user still has another paid period running (e.g. a Pix payment)
    const { data: otherAccess } = await admin
      .from("subscriptions")
      .select("id")
      .eq("user_id", userId)
      .neq("stripe_subscription_id", sub.id)
      .in("status", ["active", "trialing", "past_due"])
      .gt("current_period_end", new Date().toISOString())
      .limit(1);
    if (otherAccess && otherAccess.length > 0) return;

    const { error: revokeError } = await admin
      .from("profiles")
      .update({ account_status: "trial", trial_ends_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("is_admin", false);
    if (revokeError) throw new Error(revokeError.message);
  }
}

// A Pix payment buys 30 days of access (one-off, not recurring). Renewing early adds
// 30 days on top of the access that is still running. One row per payment, keyed by the
// Checkout Session id (cs_...), so a repeated event never grants twice.
async function grantPixAccess(
  // deno-lint-ignore no-explicit-any
  admin: any,
  session: Stripe.Checkout.Session,
) {
  const userId = session.client_reference_id ?? session.metadata?.supabase_user_id;
  const plan = session.metadata?.plan;
  if (!userId) throw new Error(`Pix session ${session.id} has no user`);
  if (!PLANS.includes(plan as never)) throw new Error(`Pix session ${session.id} has no valid plan`);

  const { data: already } = await admin
    .from("subscriptions")
    .select("id")
    .eq("stripe_subscription_id", session.id)
    .limit(1);
  if (already && already.length > 0) return; // already granted

  const nowIso = new Date().toISOString();
  const { data: running } = await admin
    .from("subscriptions")
    .select("current_period_end")
    .eq("user_id", userId)
    .in("status", ["active", "trialing", "past_due"])
    .gt("current_period_end", nowIso)
    .order("current_period_end", { ascending: false })
    .limit(1);

  const base = running?.[0]?.current_period_end ? new Date(running[0].current_period_end) : new Date();
  const end = new Date(base.getTime() + 30 * 24 * 60 * 60 * 1000);

  const { error } = await admin.from("subscriptions").upsert(
    {
      user_id: userId,
      stripe_subscription_id: session.id,
      stripe_customer_id: (session.customer as string) ?? "",
      plan,
      status: "active",
      current_period_end: end.toISOString(),
      cancel_at_period_end: true, // does not renew by itself
    },
    { onConflict: "stripe_subscription_id" },
  );
  if (error) throw new Error(error.message);
}
