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

    // Process nutritionists
    const { data: nutritionists, error: nutritionistsError } = await supabase
      .from('profiles')
      .select('user_id, full_name, trial_start_date')
      .eq('subscription_status', 'trial')
      .not('trial_start_date', 'is', null)
      .eq('trial_ended', false);

    if (nutritionistsError) {
      console.error("Error fetching nutritionists:", nutritionistsError);
      throw nutritionistsError;
    }

    const trialDays = [3, 7, 14, 21, 28, 33];
    let nutritionistsProcessed = nutritionists?.length || 0;

    for (const nutritionist of nutritionists || []) {
      const daysInTrial = Math.floor((Date.now() - new Date(nutritionist.trial_start_date).getTime()) / 86400000);

      if (trialDays.includes(daysInTrial)) {
        const emailType = daysInTrial === 33 ? 'trial-expired' : `trial-day-${daysInTrial}`;

        // Check if email already sent
        const { data: existingLog } = await supabase
          .from('email_logs')
          .select('id')
          .eq('user_id', nutritionist.user_id)
          .eq('email_type', emailType)
          .maybeSingle();

        if (!existingLog) {
          // Invoke send-trial-followup-email
          const { error: invokeError } = await supabase.functions.invoke('send-trial-followup-email', {
            body: { user_id: nutritionist.user_id, email_type: emailType }
          });

          if (invokeError) {
            console.error(`Error sending email to nutritionist ${nutritionist.user_id}:`, invokeError);
          } else {
            emailsSent++;
            console.log(`Sent ${emailType} email to nutritionist ${nutritionist.user_id}`);
          }
        }
      }
    }

    // Process patients
    const { data: patients, error: patientsError } = await supabase
      .from('patients')
      .select('user_id, full_name, created_at')
      .not('user_id', 'is', null);

    if (patientsError) {
      console.error("Error fetching patients:", patientsError);
      throw patientsError;
    }

    const patientDays = [7, 14];
    let patientsProcessed = patients?.length || 0;

    for (const patient of patients || []) {
      const daysRegistered = Math.floor((Date.now() - new Date(patient.created_at).getTime()) / 86400000);

      if (patientDays.includes(daysRegistered)) {
        const emailType = `patient-day-${daysRegistered}`;

        // Check if email already sent
        const { data: existingLog } = await supabase
          .from('email_logs')
          .select('id')
          .eq('user_id', patient.user_id)
          .eq('email_type', emailType)
          .maybeSingle();

        if (!existingLog) {
          // Invoke send-trial-followup-email
          const { error: invokeError } = await supabase.functions.invoke('send-trial-followup-email', {
            body: { user_id: patient.user_id, email_type: emailType }
          });

          if (invokeError) {
            console.error(`Error sending email to patient ${patient.user_id}:`, invokeError);
          } else {
            emailsSent++;
            console.log(`Sent ${emailType} email to patient ${patient.user_id}`);
          }
        }
      }
    }

    console.log(`Daily trial emails processed: ${nutritionistsProcessed} nutritionists, ${patientsProcessed} patients, ${emailsSent} emails sent`);

    return new Response(
      JSON.stringify({
        success: true,
        nutritionists_processed: nutritionistsProcessed,
        patients_processed: patientsProcessed,
        emails_sent: emailsSent
      }),
      {
        status: 200,
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