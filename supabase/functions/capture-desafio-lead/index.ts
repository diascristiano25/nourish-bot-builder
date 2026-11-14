import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

// Recebe e-mail + WhatsApp do /desafio-nutri, grava o lead e manda a primeira
// mensagem pelo Evolution API. Secrets necessários (supabase secrets set):
//   EVOLUTION_API_URL      ex.: https://evolution.seudominio.com
//   EVOLUTION_API_KEY      apikey da instância
//   EVOLUTION_INSTANCE     nome da instância conectada ao seu WhatsApp
//   FOUNDER_NAME           (opcional) seu primeiro nome, usado na apresentação
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];

// 11999999999 -> 5511999999999 (formato que o Evolution espera)
function normalizePhone(raw: string): string | null {
  let d = raw.replace(/\D/g, "");
  if (d.startsWith("55") && d.length >= 12) return d;
  if (d.length === 10 || d.length === 11) return `55${d}`;
  return null;
}

function buildMessage(lostHours: number | null): string {
  // FOUNDER_NAME (secret opcional): seu primeiro nome, para a mensagem soar pessoal
  const nome = Deno.env.get("FOUNDER_NAME")?.trim();
  const abertura = nome
    ? `Oi! Aqui é ${nome}, eu criei o NutriFlow`
    : "Oi! Eu criei o NutriFlow";
  const resultado = lostHours && lostHours > 0
    ? `Vi no seu diagnóstico que você gasta cerca de ${lostHours} horas por semana montando cardápio na mão. `
    : "";
  return (
    `${abertura}, o sistema que ajuda nutricionistas a montar cardápio com IA e a acompanhar os pacientes. 👋\n\n` +
    `Você acabou de fazer o diagnóstico no Desafio Nutri. ${resultado}` +
    `Fiquei feliz de você ter passado por aqui!\n\n` +
    `Seu teste grátis de 14 dias já está liberado: é só terminar o cadastro com nome e senha. ` +
    `Eu mesmo acompanho cada cadastro, então se travar em qualquer etapa ou tiver dúvida, é só me responder aqui que eu te ajudo.`
  );
}

async function sendWhatsApp(phone: string, text: string): Promise<string | null> {
  const url = Deno.env.get("EVOLUTION_API_URL");
  const key = Deno.env.get("EVOLUTION_API_KEY");
  const instance = Deno.env.get("EVOLUTION_INSTANCE");
  if (!url || !key || !instance) return "evolution_not_configured";

  try {
    const res = await fetch(`${url.replace(/\/$/, "")}/message/sendText/${encodeURIComponent(instance)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: key },
      body: JSON.stringify({ number: phone, text }),
    });
    if (!res.ok) return `evolution_${res.status}: ${(await res.text()).slice(0, 300)}`;
    return null;
  } catch (e) {
    return `evolution_fetch: ${e instanceof Error ? e.message : String(e)}`;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const phone = typeof body.whatsapp === "string" ? normalizePhone(body.whatsapp) : null;
  if (!EMAIL_RE.test(email)) return json({ error: "invalid_email" }, 400);
  if (!phone) return json({ error: "invalid_whatsapp" }, 400);

  const lostHours = typeof body.lost_hours === "number" && body.lost_hours >= 0 && body.lost_hours <= 200
    ? Math.round(body.lost_hours)
    : null;

  const utm: Record<string, string> = {};
  const rawUtm = (body.utm ?? {}) as Record<string, unknown>;
  for (const k of UTM_KEYS) {
    const v = rawUtm[k];
    if (typeof v === "string" && v) utm[k] = v.slice(0, 200);
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: existing } = await supabase
    .from("desafio_leads")
    .select("id, whatsapp_sent_at")
    .eq("email", email)
    .maybeSingle();

  const { data: lead, error } = await supabase
    .from("desafio_leads")
    .upsert(
      { email, whatsapp: phone, lost_hours: lostHours, utm, updated_at: new Date().toISOString() },
      { onConflict: "email" },
    )
    .select("id")
    .single();

  if (error || !lead) {
    console.error("capture-desafio-lead upsert failed", error);
    return json({ error: "save_failed" }, 500);
  }

  // Só manda a mensagem uma vez por lead (clique repetido não reenvia)
  if (!existing?.whatsapp_sent_at) {
    const err = await sendWhatsApp(phone, buildMessage(lostHours));
    await supabase
      .from("desafio_leads")
      .update(err ? { whatsapp_error: err } : { whatsapp_sent_at: new Date().toISOString(), whatsapp_error: null })
      .eq("id", lead.id);
    if (err) console.error("capture-desafio-lead whatsapp failed", err);
  }

  return json({ ok: true });
});
