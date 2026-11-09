// Creates a Stripe Checkout Session (subscription) for the authenticated nutritionist.
// Trial is not billed here: the trial lives in the app (profiles.trial_start_date).
import {
  adminClient, APP_URL, authenticate, corsHeaders, json,
  Plan, PLANS, priceIdFor, stripe,
} from "../_shared/stripe.ts";

async function handle(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json(405, { error: "Method not allowed" });

  const user = await authenticate(req);
  if (!user) return json(401, { error: "Unauthorized" });

  let plan: Plan;
  let method: "card" | "pix" = "card";
  try {
    const body = await req.json();
    plan = body.plan;
    method = body.method === "pix" ? "pix" : "card";
  } catch {
    return json(400, { error: "Invalid JSON" });
  }
  if (!PLANS.includes(plan)) return json(400, { error: "Invalid plan" });

  const priceId = priceIdFor(plan);
  if (!priceId) return json(500, { error: `Missing price secret for plan ${plan}` });

  const admin = adminClient();

  // Block buying while a card subscription (sub_...) is active. Pix payments (cs_...)
  // are one-off, so paying again before they end simply adds 30 days.
  const { data: existing } = await admin
    .from("subscriptions")
    .select("id, status")
    .eq("user_id", user.id)
    .like("stripe_subscription_id", "sub_%")
    .in("status", ["active", "trialing", "past_due"])
    .limit(1);
  if (existing && existing.length > 0) {
    return json(409, { error: "Already subscribed. Use the billing portal." });
  }

  // Reuse or create the Stripe customer
  const { data: customerRow } = await admin
    .from("stripe_customers")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  let customerId = customerRow?.stripe_customer_id as string | undefined;

  // A stored customer may not exist in Stripe anymore (e.g. it was created in test mode
  // and the account is now live). In that case create a fresh one.
  if (customerId) {
    try {
      const existingCustomer = await stripe.customers.retrieve(customerId);
      if ((existingCustomer as { deleted?: boolean }).deleted) customerId = undefined;
    } catch (err) {
      if ((err as { code?: string }).code === "resource_missing") customerId = undefined;
      else throw err;
    }
  }

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;
    const { error } = await admin
      .from("stripe_customers")
      .upsert({ user_id: user.id, stripe_customer_id: customerId });
    if (error) return json(500, { error: "Could not save customer" });
  }

  if (method === "pix") {
    // Pix cannot be used in subscription mode: charge 30 days as a one-off payment.
    const price = await stripe.prices.retrieve(priceId);
    if (price.unit_amount == null) return json(500, { error: "Price has no amount" });

    const pixSession = await stripe.checkout.sessions.create({
      mode: "payment",
      customer: customerId,
      client_reference_id: user.id,
      line_items: [{
        price_data: {
          currency: "brl",
          unit_amount: price.unit_amount,
          product_data: { name: `NutriFlow ${plan} - 30 dias (Pix)` },
        },
        quantity: 1,
      }],
      payment_method_types: ["pix"],
      payment_method_options: { pix: { expires_after_seconds: 3600 } },
      locale: "pt-BR",
      metadata: { supabase_user_id: user.id, plan, kind: "pix_30d" },
      success_url: `${APP_URL()}/assinatura?status=success&method=pix&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL()}/assinatura?status=cancelled`,
    });
    return json(200, { url: pixSession.url });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    client_reference_id: user.id,
    line_items: [{ price: priceId, quantity: 1 }],
    // Pix is NOT accepted by Stripe in subscription mode (tested in test mode).
    payment_method_types: ["card"],
    locale: "pt-BR",
    subscription_data: {
      metadata: { supabase_user_id: user.id, plan },
    },
    success_url: `${APP_URL()}/assinatura?status=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${APP_URL()}/assinatura?status=cancelled`,
  });

  return json(200, { url: session.url });
}

// Any unexpected error returns JSON with CORS headers, so the browser shows the real message.
Deno.serve(async (req) => {
  try {
    return await handle(req);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("create-checkout failed:", message);
    return json(500, { error: message });
  }
});
