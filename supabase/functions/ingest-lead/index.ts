import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Token auth
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.replace("Bearer ", "");
  const expectedToken = Deno.env.get("NUTRIFLOW_N8N_TOKEN");

  if (!expectedToken || token !== expectedToken) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Parse and validate body
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { nome, whatsapp, instagram, contexto_post } = body as {
    nome: string;
    whatsapp: string;
    instagram?: string;
    contexto_post?: string;
  };

  if (!nome || typeof nome !== "string" || nome.trim().length === 0) {
    return new Response(JSON.stringify({ error: "Field 'nome' is required" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!whatsapp || typeof whatsapp !== "string" || whatsapp.trim().length === 0) {
    return new Response(JSON.stringify({ error: "Field 'whatsapp' is required" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Insert using service role (bypasses RLS)
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data, error } = await supabase.from("leads_nutriflow").upsert(
    {
      nome: nome.trim(),
      whatsapp: whatsapp.trim(),
      instagram: instagram?.trim() || null,
      contexto_post: contexto_post?.trim() || null,
      status: "novo",
      ultima_interacao: new Date().toISOString(),
    },
    { onConflict: "whatsapp" }
  ).select();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ success: true, lead: data?.[0] }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
