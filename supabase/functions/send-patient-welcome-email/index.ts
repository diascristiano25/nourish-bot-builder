import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PatientWelcomeRequest {
  email: string;
  name: string;
  phone?: string;
  nutritionistName?: string;
  user_id?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("send-patient-welcome-email function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name, phone, nutritionistName, user_id }: PatientWelcomeRequest = await req.json();

    if (!email) {
      throw new Error("Email is required");
    }

    if (!name) {
      throw new Error("Name is required");
    }

    // Callable without a session (first access, signup with email
    // confirmation), so only send to a real, not-yet-welcomed account
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const respond = (status: number, body: Record<string, unknown>) =>
      new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });

    if (user_id) {
      const { data: patientRow } = await supabase
        .from("patients")
        .select("email")
        .eq("user_id", user_id)
        .maybeSingle();
      if (!patientRow || patientRow.email?.toLowerCase() !== email.toLowerCase()) {
        return respond(403, { success: false, error: "Forbidden" });
      }

      const { data: alreadySent } = await supabase
        .from("email_logs")
        .select("id")
        .eq("user_id", user_id)
        .eq("email_type", "patient-welcome")
        .maybeSingle();
      if (alreadySent) {
        return respond(200, { success: true, already_sent: true });
      }
    } else {
      // Manual resend from the nutritionist screen: needs a valid user session
      const token = req.headers.get("Authorization")?.replace("Bearer ", "");
      const userRes = token
        ? await fetch(`${Deno.env.get("SUPABASE_URL")}/auth/v1/user`, {
            headers: { Authorization: `Bearer ${token}`, apikey: Deno.env.get("SUPABASE_ANON_KEY") || "" },
          })
        : null;
      if (!userRes?.ok) {
        return respond(401, { success: false, error: "Unauthorized" });
      }
    }

    const firstName = name.split(" ")[0] || "Paciente";
    const nutriName = nutritionistName || "seu nutricionista";

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
            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">Seu app de acompanhamento nutricional</p>
          </div>

          <div style="background: white; padding: 40px 32px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            <h2 style="color: #18181b; margin: 0 0 16px 0; font-size: 22px;">Olá, ${firstName}! 🎉</h2>

            <p style="color: #52525b; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
              Seu portal pessoal no NutriFlow foi criado por ${nutriName}. Agora você pode acompanhar sua jornada nutricional de forma simples e organizada.
            </p>

            <div style="background: #f0fdf4; padding: 16px 20px; margin: 24px 0; border-radius: 8px;">
              <p style="color: #166534; margin: 0; font-size: 15px; font-weight: 500;">
                📱 Acesse seu portal pelo celular ou computador — tudo sincronizado em tempo real.
              </p>
            </div>

            <h3 style="color: #18181b; margin: 32px 0 16px 0; font-size: 18px;">O que você encontra no seu portal:</h3>

            <ul style="color: #52525b; font-size: 15px; line-height: 2; padding-left: 20px; margin: 0 0 32px 0;">
              <li>✅ Plano alimentar personalizado</li>
              <li>✅ Receitas adaptadas aos seus objetivos</li>
              <li>✅ Lista de compras automática</li>
              <li>✅ Registro de refeições e evolução</li>
              <li>✅ Agenda de consultas e lembretes</li>
            </ul>

            <div style="text-align: center; margin: 32px 0;">
              <a href="https://nutriflow.inf.br/patient-auth"
                 style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
                Acessar Meu Portal →
              </a>
            </div>

            <p style="color: #52525b; font-size: 15px; line-height: 1.6; margin: 0 0 32px 0;">
              Para entrar pela primeira vez, use seu email (<strong>${email}</strong>) e clique em "Esqueci minha senha" para definir sua senha inicial. Simples assim!
            </p>

            ${phone ? `<p style="color: #71717a; font-size: 14px; margin: 0 0 8px 0;">📞 Telefone cadastrado: ${phone}</p>` : ""}

            <p style="color: #a1a1aa; font-size: 14px; text-align: center; margin: 32px 0 0 0; padding-top: 24px; border-top: 1px solid #e4e4e7;">
              Dúvidas? Responda este email ou entre em contato com ${nutriName}.
            </p>
          </div>

          <p style="color: #a1a1aa; font-size: 12px; text-align: center; margin: 24px 0 0 0;">
            © ${new Date().getFullYear()} NutriFlow. Todos os direitos reservados.
          </p>
        </div>
      </body>
      </html>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "NutriFlow <noreply@nutriflow.inf.br>",
        to: [email],
        subject: `Bem-vindo ao NutriFlow, ${firstName}! 🥗`,
        html: htmlContent,
      }),
    });

    const emailResponse = await res.json();

    if (!res.ok) {
      console.error("Resend API error:", emailResponse);
      throw new Error(emailResponse.message || "Failed to send patient welcome email");
    }

    console.log(`Patient welcome email sent successfully to ${email}`);

    // Record the send so the backfill and cron never email this user again
    if (user_id) {
      const { error: logError } = await supabase
        .from("email_logs")
        .insert({ user_id, email_type: "patient-welcome", metadata: { email_id: emailResponse.id } });
      if (logError) console.error("Failed to log email:", logError);
    }


    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-patient-welcome-email function:", error);
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