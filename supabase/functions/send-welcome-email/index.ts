import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  email: string;
  name: string;
  user_id?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("send-welcome-email function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name, user_id }: WelcomeEmailRequest = await req.json();

    if (!email) {
      throw new Error("Email is required");
    }

    const firstName = name?.split(" ")[0] || "Nutricionista";

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
            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">Bem-vindo ao futuro da nutrição!</p>
          </div>

          <div style="background: white; padding: 40px 32px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            <h2 style="color: #18181b; margin: 0 0 16px 0; font-size: 22px;">Olá, ${firstName}! 🎉</h2>

            <p style="color: #52525b; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
              Seja muito bem-vindo(a) ao NutriFlow! Sua conta foi criada com sucesso e você está pronto(a) para transformar a experiência dos seus pacientes.
            </p>

            <div style="background: #f0fdf4; padding: 16px 20px; margin: 24px 0; border-radius: 8px;">
              <p style="color: #166534; margin: 0; font-size: 15px; font-weight: 500;">
                🚀 Comece agora: cadastre seu primeiro paciente e descubra como a IA pode acelerar sua rotina em até 70%.
              </p>
            </div>

            <h3 style="color: #18181b; margin: 32px 0 16px 0; font-size: 18px;">O que você pode fazer agora:</h3>

            <ul style="color: #52525b; font-size: 15px; line-height: 2; padding-left: 20px; margin: 0 0 32px 0;">
              <li>✅ Cadastrar pacientes com histórico completo</li>
              <li>✅ Gerar planos alimentares personalizados com IA</li>
              <li>✅ Enviar receitas e listas de compras automáticas</li>
              <li>✅ Acompanhar evolução e adesão em tempo real</li>
              <li>✅ Liberar o app do paciente com um clique</li>
            </ul>

            <div style="text-align: center; margin: 32px 0;">
              <a href="https://nutriflow.inf.br/patients/new"
                 style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
                Cadastrar Primeiro Paciente →
              </a>
            </div>

            <p style="color: #52525b; font-size: 15px; line-height: 1.6; margin: 0 0 32px 0;">
              Se tiver qualquer dúvida, responda este e-mail ou acesse nosso suporte dentro do painel. Estamos aqui para ajudar você a aproveitar o máximo do NutriFlow.
            </p>

            <p style="color: #a1a1aa; font-size: 14px; text-align: center; margin: 32px 0 0 0; padding-top: 24px; border-top: 1px solid #e4e4e7;">
              Este é um e-mail automático. Para suporte, responda esta mensagem ou acesse nutriflow.inf.br/suporte.
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
        subject: "Bem-vindo ao NutriFlow! 🥗 Sua jornada começa agora",
        html: htmlContent,
      }),
    });

    const emailResponse = await res.json();

    if (!res.ok) {
      console.error("Resend API error:", emailResponse);
      throw new Error(emailResponse.message || "Failed to send welcome email");
    }

    console.log(`Welcome email sent successfully to ${email}`);

    // Record the send so the backfill and cron never email this user again
    if (user_id) {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );
      const { error: logError } = await supabase
        .from("email_logs")
        .insert({ user_id, email_type: "welcome", metadata: { email_id: emailResponse.id } });
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
    console.error("Error in send-welcome-email function:", error);
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