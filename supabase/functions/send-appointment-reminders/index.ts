import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Appointment {
  id: string;
  patient_id: string;
  start_time: string;
  status: string;
  reminder_sent_at: string | null;
}

interface Profile {
  id: string;
  email: string;
  full_name: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("send-appointment-reminders function called");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Query appointments needing reminders: scheduled, within 24h, no reminder sent
    const now = new Date();
    const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const { data: appointments, error: queryError } = await supabase
      .from("appointments")
      .select("*")
      .eq("status", "scheduled")
      .is("reminder_sent_at", null)
      .gte("start_time", now.toISOString())
      .lte("start_time", twentyFourHoursFromNow.toISOString());

    if (queryError) {
      console.error("Error querying appointments:", queryError);
      throw new Error(`Failed to query appointments: ${queryError.message}`);
    }

    console.log(`Found ${appointments?.length || 0} appointments needing reminders`);

    const results = [];

    for (const appointment of appointments || []) {
      try {
        // Get patient profile for email
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("email, full_name")
          .eq("id", appointment.patient_id)
          .single();

        if (profileError || !profile?.email) {
          console.warn(`No email found for patient ${appointment.patient_id}`);
          continue;
        }

        const firstName = profile.full_name?.split(" ")[0] || "Paciente";
        const appointmentDate = new Date(appointment.start_time).toLocaleString("pt-BR", {
          weekday: "long",
          day: "2-digit",
          month: "long",
          hour: "2-digit",
          minute: "2-digit",
        });

        const htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
              <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 16px 16px 0 0; padding: 32px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">🥗 NutriFlow</h1>
                <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">Lembrete de Consulta</p>
              </div>

              <div style="background: white; padding: 40px 32px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                <h2 style="color: #18181b; margin: 0 0 16px 0; font-size: 22px;">Olá, ${firstName}! 👋</h2>

                <p style="color: #52525b; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                  Este é um lembrete da sua consulta agendada com seu nutricionista.
                </p>

                <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 16px 20px; margin: 24px 0; border-radius: 0 8px 8px 0;">
                  <p style="color: #166534; margin: 0; font-size: 15px; font-weight: 500;">
                    📅 Data e hora: ${appointmentDate}
                  </p>
                </div>

                <p style="color: #52525b; font-size: 16px; line-height: 1.6; margin: 0 0 32px 0;">
                  Por favor, chegue com 5 minutos de antecedência. Se precisar reagendar, entre em contato com seu nutricionista.
                </p>

                <p style="color: #a1a1aa; font-size: 14px; text-align: center; margin: 32px 0 0 0; padding-top: 24px; border-top: 1px solid #e4e4e7;">
                  Precisa de ajuda? Responda este e-mail ou entre em contato com seu nutricionista.
                </p>
              </div>

              <p style="color: #a1a1aa; font-size: 12px; text-align: center; margin: 24px 0 0 0;">
                © ${new Date().getFullYear()} NutriFlow. Todos os direitos reservados.
              </p>
            </div>
          </body>
          </html>
        `;

        // Send email via Resend
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: "NutriFlow <noreply@nutriflow.inf.br>",
            to: [profile.email],
            subject: "Lembrete: Sua consulta está chegando! 📅",
            html: htmlContent,
          }),
        });

        const emailResponse = await res.json();

        if (!res.ok) {
          console.error("Resend API error:", emailResponse);
          throw new Error(emailResponse.message || "Failed to send email");
        }

        console.log(`Reminder email sent to ${profile.email} for appointment ${appointment.id}`);

        // Update reminder_sent_at after successful send
        const { error: updateError } = await supabase
          .from("appointments")
          .update({ reminder_sent_at: new Date().toISOString() })
          .eq("id", appointment.id);

        if (updateError) {
          console.error(`Error updating reminder_sent_at for appointment ${appointment.id}:`, updateError);
        } else {
          console.log(`Updated reminder_sent_at for appointment ${appointment.id}`);
        }

        results.push({
          appointmentId: appointment.id,
          emailSent: true,
          email: profile.email,
        });
      } catch (error) {
        console.error(`Error processing appointment ${appointment.id}:`, error);
        results.push({
          appointmentId: appointment.id,
          emailSent: false,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: results.length,
        results,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-appointment-reminders function:", error);
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