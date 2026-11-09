// Shared Stripe + Supabase helpers for billing Edge Functions.
import Stripe from "https://esm.sh/stripe@14.25.0?target=deno";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, " +
    "x-supabase-client-platform, x-supabase-client-platform-version, " +
    "x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

export const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  apiVersion: "2024-06-20",
  httpClient: Stripe.createFetchHttpClient(),
});

export const PLANS = ["starter", "pro", "enterprise"] as const;
export type Plan = (typeof PLANS)[number];

// Price IDs come from Supabase secrets, never from code.
export function priceIdFor(plan: Plan): string | undefined {
  const map: Record<Plan, string> = {
    starter: "STRIPE_PRICE_STARTER",
    pro: "STRIPE_PRICE_PRO",
    enterprise: "STRIPE_PRICE_ENTERPRISE",
  };
  return Deno.env.get(map[plan]);
}

// Service-role client: bypasses RLS. Only use server-side after authenticating the caller.
export function adminClient(): SupabaseClient {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}

// Resolves the caller from the Authorization header. Returns null if not authenticated.
export async function authenticate(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const client = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) return null;
  return data.user;
}

export const APP_URL = () => Deno.env.get("APP_URL") ?? "http://localhost:5173";
