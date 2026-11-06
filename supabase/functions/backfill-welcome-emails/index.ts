import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  console.log("backfill-welcome-emails function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate cron secret for security
    const authHeader = req.headers.get("Authorization");
    const CRON_SECRET = Deno.env.get("CRON_SECRET");

    if (!CRON_SECRET || authHeader !== `Bearer ${CRON_SECRET}`) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const dryRun = new URL(req.url).searchParams.get("dry_run") === "true";

    let nutritionistsSent = 0;
    let patientsSent = 0;

    const { data: logs } = await supabase
      .from("email_logs")
      .select("user_id, email_type")
      .in("email_type", ["welcome", "patient-welcome"]);

    const welcomed = new Set((logs || []).map((l) => `${l.email_type}:${l.user_id}`));

    // Backfill nutritionists who have no welcome email logged
    // (the send function records the log itself when given user_id)
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, full_name")
      .eq("is_admin", false);

    // profiles has no email column; read it from auth.users
    const emailById = new Map<string, string>();
    const { data: authEmails, error: emailsError } = await supabase.rpc("get_auth_emails");
    if (emailsError) throw emailsError;
    for (const u of authEmails || []) emailById.set(u.id, u.email);

    const nutritionists = (profiles || [])
      .filter((p) => emailById.has(p.user_id))
      .map((p) => ({ ...p, email: emailById.get(p.user_id)! }));

    for (const n of nutritionists) {
      if (welcomed.has(`welcome:${n.user_id}`)) continue;
      if (dryRun) {
        nutritionistsSent++;
        continue;
      }
      const { error } = await supabase.functions.invoke("send-welcome-email", {
        body: { email: n.email, name: n.full_name, user_id: n.user_id },
      });
      if (!error) {
        nutritionistsSent++;
        console.log(`Backfill welcome sent to nutritionist ${n.user_id}`);
      } else {
        console.error(`Backfill welcome failed for nutritionist ${n.user_id}:`, error);
      }
    }

    // Backfill patients who have user_id and no welcome email logged
    const { data: patients } = await supabase
      .from("patients")
      .select("user_id, full_name, email")
      .not("user_id", "is", null)
      .not("email", "is", null);

    for (const p of patients || []) {
      if (welcomed.has(`patient-welcome:${p.user_id}`)) continue;
      if (dryRun) {
        patientsSent++;
        continue;
      }
      const { error } = await supabase.functions.invoke("send-patient-welcome-email", {
        body: { email: p.email, name: p.full_name, user_id: p.user_id },
      });
      if (!error) {
        patientsSent++;
        console.log(`Backfill welcome sent to patient ${p.user_id}`);
      } else {
        console.error(`Backfill welcome failed for patient ${p.user_id}:`, error);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        dry_run: dryRun,
        nutritionists_sent: nutritionistsSent,
        patients_sent: patientsSent,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in backfill-welcome-emails:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);