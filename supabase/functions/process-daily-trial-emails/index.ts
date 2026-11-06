import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  console.log("process-daily-trial-emails function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate cron secret
    const authHeader = req.headers.get("Authorization");
    const CRON_SECRET = Deno.env.get("CRON_SECRET");

    if (!CRON_SECRET || authHeader !== `Bearer ${CRON_SECRET}`) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Create Supabase client with service role key
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    let emailsSent = 0;
    let failures = 0;

    // Sent email types per user, loaded once instead of one query per user
    const { data: logs, error: logsError } = await supabase
      .from('email_logs')
      .select('user_id, email_type');

    if (logsError) {
      console.error("Error fetching email logs:", logsError);
      throw logsError;
    }

    const sentByUser = new Map<string, Set<string>>();
    for (const log of logs || []) {
      if (!sentByUser.has(log.user_id)) sentByUser.set(log.user_id, new Set());
      sentByUser.get(log.user_id)!.add(log.email_type);
    }

    // Sends the latest step already due that is newer than anything sent, so
    // a missed cron run or an existing user mid-journey still catches up
    // (one email per user per run, never an older step after a newer one)
    const processUser = async (
      userId: string,
      days: number,
      steps: { day: number; type: string }[]
    ) => {
      const sent = sentByUser.get(userId) || new Set<string>();
      const latestSentDay = Math.max(0, ...steps.filter((step) => sent.has(step.type)).map((step) => step.day));
      const target = steps.filter((step) => days >= step.day && step.day > latestSentDay).pop();

      if (!target) return;

      const { error: invokeError } = await supabase.functions.invoke('send-trial-followup-email', {
        body: { user_id: userId, email_type: target.type }
      });

      if (invokeError) {
        failures++;
        console.error(`Error sending ${target.type} to ${userId}:`, invokeError);
      } else {
        emailsSent++;
        console.log(`Sent ${target.type} email to ${userId}`);
      }
    };

    const nutritionistSteps = [
      { day: 3, type: 'trial-day-3' },
      { day: 7, type: 'trial-day-7' },
      { day: 14, type: 'trial-day-14' },
      { day: 21, type: 'trial-day-21' },
      { day: 28, type: 'trial-day-28' },
      { day: 33, type: 'trial-expired' },
    ];

    const { data: nutritionists, error: nutritionistsError } = await supabase
      .from('profiles')
      .select('user_id, created_at, trial_ends_at')
      .eq('account_status', 'trial')
      .eq('is_admin', false);

    if (nutritionistsError) {
      console.error("Error fetching nutritionists:", nutritionistsError);
      throw nutritionistsError;
    }

    for (const nutritionist of nutritionists || []) {
      let days = Math.floor((Date.now() - new Date(nutritionist.created_at).getTime()) / 86400000);
      // A trial already past its end date is due the expiry email, whatever its length
      if (nutritionist.trial_ends_at && new Date(nutritionist.trial_ends_at).getTime() < Date.now()) {
        days = Math.max(days, 33);
      }
      await processUser(nutritionist.user_id, days, nutritionistSteps);
    }

    const patientSteps = [
      { day: 7, type: 'patient-day-7' },
      { day: 14, type: 'patient-day-14' },
    ];

    const { data: patients, error: patientsError } = await supabase
      .from('patients')
      .select('user_id, created_at')
      .not('user_id', 'is', null)
      .not('email', 'is', null);

    if (patientsError) {
      console.error("Error fetching patients:", patientsError);
      throw patientsError;
    }

    for (const patient of patients || []) {
      const days = Math.floor((Date.now() - new Date(patient.created_at).getTime()) / 86400000);
      await processUser(patient.user_id, days, patientSteps);
    }

    console.log(`Daily trial emails: ${nutritionists?.length || 0} nutritionists, ${patients?.length || 0} patients, ${emailsSent} sent, ${failures} failed`);

    return new Response(
      JSON.stringify({
        success: failures === 0,
        nutritionists_processed: nutritionists?.length || 0,
        patients_processed: patients?.length || 0,
        emails_sent: emailsSent,
        failures
      }),
      {
        status: failures === 0 ? 200 : 207,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in process-daily-trial-emails function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
