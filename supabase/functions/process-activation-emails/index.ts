import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// E-mails de ativação por comportamento (roda de hora em hora via pg_cron):
//  - activation-no-patient: conta criada há 2h+ (até 10 dias), nenhum paciente cadastrado
//  - activation-no-plan:    tem paciente há 6h+, nenhum plano alimentar gerado
//  - trial-last-day:        trial termina em até 36h (personalizado com o que a pessoa fez)
// Cada tipo é enviado uma única vez por usuário (idempotência em send-trial-followup-email).
// Body opcional: { "dry_run": true } só lista quem receberia, sem enviar.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const HOUR = 3600_000;
const MAX_PER_RUN = 30;
const COOLDOWN_HOURS = 20; // não empilha com outro e-mail recente (exceto o último dia do trial)
const SEND_FROM_UTC_HOUR = 11; // 08h BRT
const SEND_TO_UTC_HOUR = 23; // 20h BRT

type Candidate = { user_id: string; email_type: string };

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...corsHeaders } });

  try {
    const CRON_SECRET = Deno.env.get("CRON_SECRET");
    if (!CRON_SECRET || req.headers.get("Authorization") !== `Bearer ${CRON_SECRET}`) {
      return json({ success: false, error: "Unauthorized" }, 401);
    }

    let dryRun = false;
    try {
      dryRun = (await req.json())?.dry_run === true;
    } catch { /* corpo vazio */ }

    const now = Date.now();
    const utcHour = new Date(now).getUTCHours();
    if (!dryRun && (utcHour < SEND_FROM_UTC_HOUR || utcHour > SEND_TO_UTC_HOUR)) {
      return json({ success: true, skipped: "outside_send_window" });
    }

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const { data: nutritionists, error: nutritionistsError } = await supabase
      .from("profiles")
      .select("id, user_id, created_at, trial_ends_at")
      .eq("account_status", "trial")
      .eq("is_admin", false);
    if (nutritionistsError) throw nutritionistsError;
    if (!nutritionists?.length) return json({ success: true, candidates: 0, sent: 0 });

    const profileIds = nutritionists.map((n) => n.id);
    const userIds = nutritionists.map((n) => n.user_id);

    const [patientsRes, plansRes, logsRes] = await Promise.all([
      supabase.from("patients").select("nutritionist_id, created_at").in("nutritionist_id", profileIds),
      supabase.from("meal_plans").select("nutritionist_id").in("nutritionist_id", profileIds),
      supabase.from("email_logs").select("user_id, email_type, sent_at").in("user_id", userIds),
    ]);
    for (const r of [patientsRes, plansRes, logsRes]) if (r.error) throw r.error;

    const firstPatientAt = new Map<string, number>();
    for (const p of patientsRes.data ?? []) {
      const t = new Date(p.created_at).getTime();
      const prev = firstPatientAt.get(p.nutritionist_id);
      if (prev === undefined || t < prev) firstPatientAt.set(p.nutritionist_id, t);
    }
    const withPlan = new Set((plansRes.data ?? []).map((p) => p.nutritionist_id));

    const sentTypes = new Map<string, Set<string>>();
    const lastSentAt = new Map<string, number>();
    for (const log of logsRes.data ?? []) {
      if (!sentTypes.has(log.user_id)) sentTypes.set(log.user_id, new Set());
      sentTypes.get(log.user_id)!.add(log.email_type);
      const t = new Date(log.sent_at).getTime();
      if (t > (lastSentAt.get(log.user_id) ?? 0)) lastSentAt.set(log.user_id, t);
    }

    const candidates: Candidate[] = [];
    for (const n of nutritionists) {
      const sent = sentTypes.get(n.user_id) ?? new Set<string>();
      const ageH = (now - new Date(n.created_at).getTime()) / HOUR;
      const trialEnds = n.trial_ends_at ? new Date(n.trial_ends_at).getTime() : null;
      const trialActive = trialEnds === null || trialEnds > now;
      const patientAt = firstPatientAt.get(n.id);

      // Último dia do trial: prioridade máxima, ignora o intervalo mínimo entre e-mails
      if (trialEnds !== null && trialEnds > now && trialEnds - now <= 36 * HOUR && !sent.has("trial-last-day")) {
        candidates.push({ user_id: n.user_id, email_type: "trial-last-day" });
        continue;
      }

      const recentlyEmailed = now - (lastSentAt.get(n.user_id) ?? 0) < COOLDOWN_HOURS * HOUR;
      if (recentlyEmailed || !trialActive) continue;

      if (patientAt === undefined) {
        if (ageH >= 2 && ageH <= 240 && !sent.has("activation-no-patient")) {
          candidates.push({ user_id: n.user_id, email_type: "activation-no-patient" });
        }
      } else if (!withPlan.has(n.id)) {
        if ((now - patientAt) / HOUR >= 6 && !sent.has("activation-no-plan")) {
          candidates.push({ user_id: n.user_id, email_type: "activation-no-plan" });
        }
      }
    }

    const batch = candidates.slice(0, MAX_PER_RUN);
    if (dryRun) return json({ success: true, dry_run: true, total_candidates: candidates.length, would_send: batch });

    let sent = 0;
    let failures = 0;
    for (const c of batch) {
      const { error } = await supabase.functions.invoke("send-trial-followup-email", { body: c });
      if (error) {
        failures++;
        console.error(`Error sending ${c.email_type} to ${c.user_id}:`, error);
      } else {
        sent++;
      }
    }

    console.log(`Activation emails: ${candidates.length} candidates, ${sent} sent, ${failures} failed`);
    return json({ success: failures === 0, candidates: candidates.length, sent, failures }, failures === 0 ? 200 : 207);
  } catch (error: any) {
    console.error("Error in process-activation-emails function:", error);
    return json({ success: false, error: error.message }, 500);
  }
};

serve(handler);
