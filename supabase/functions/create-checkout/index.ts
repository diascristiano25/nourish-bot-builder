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
  try {
    const body = await req.json();
    plan = body.plan;
  } catch {
    return json(400, { error: "Invalid JSON" });
  }
  if (!PLANS.includes(plan)) return json(400, { error: "Invalid plan" });

  const priceId = priceIdFor(plan);
  if (!priceId) return json(500, { error: `Missing price secret for plan ${plan}` });

  const admin = adminClient();

  // Block a second active subscription
  const { data: existing } = await admin
    .from("subscriptions")
    .select("id, status")
    .eq("user_id", user.id)
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
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;
    const { error } = await admin
      .from("stripe_customers")
      .insert({ user_id: user.id, stripe_customer_id: customerId });
    if (error) return json(500, { error: "Could not save customer" });
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
