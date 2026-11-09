// Opens the Stripe Billing Portal so the nutritionist can change card or cancel.
import {
  adminClient, APP_URL, authenticate, corsHeaders, json, stripe,
} from "../_shared/stripe.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json(405, { error: "Method not allowed" });

  const user = await authenticate(req);
  if (!user) return json(401, { error: "Unauthorized" });

  const { data: customerRow } = await adminClient()
    .from("stripe_customers")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!customerRow) return json(404, { error: "No billing account yet" });

  const session = await stripe.billingPortal.sessions.create({
    customer: customerRow.stripe_customer_id,
    return_url: `${APP_URL()}/assinatura`,
  });

  return json(200, { url: session.url });
});
