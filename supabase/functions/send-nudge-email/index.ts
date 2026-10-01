import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = "re_FjkR93Le_3kHDjEzjU7Sxa5G8bod8GPq4";

// Domínio verificado - modo produção ativo
const TEST_MODE = false;
const TEST_EMAIL = "dhyaazcristiano@gmail.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NudgeEmailRequest {
  name: string;
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("send-nudge-email function called");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email }: NudgeEmailRequest = await req.json();
    
    console.log(`Sending nudge email to: ${email} (${name})`);

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
            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">Sistema Inteligente de Nutrição</p>
          </div>
          
          <div style="background: white; padding: 40px 32px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            <h2 style="color: #18181b; margin: 0 0 16px 0; font-size: 22px;">Olá, ${firstName}! 👋</h2>
            
            <p style="color: #52525b; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
              Percebemos que você ainda não cadastrou seu primeiro paciente no NutriFlow. 
              Sabemos que a rotina de um nutricionista pode ser corrida, mas estamos aqui para facilitar sua vida!
            </p>
            
            <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 16px 20px; margin: 24px 0; border-radius: 0 8px 8px 0;">
              <p style="color: #166534; margin: 0; font-size: 15px; font-weight: 500;">
                💡 Dica rápida: Em menos de 2 minutos você pode cadastrar seu primeiro paciente e gerar um plano alimentar personalizado!
              </p>
            </div>
            
            <p style="color: #52525b; font-size: 16px; line-height: 1.6; margin: 0 0 32px 0;">
              Com o NutriFlow você pode:
            </p>
            
            <ul style="color: #52525b; font-size: 15px; line-height: 2; padding-left: 20px; margin: 0 0 32px 0;">
              <li>✅ Cadastrar pacientes em segundos</li>
              <li>✅ Gerar planos alimentares com IA</li>
              <li>✅ Acompanhar evolução dos pacientes</li>
              <li>✅ Enviar receitas e listas de compras</li>
            </ul>
            
            <div style="text-align: center; margin: 32px 0;">
              <a href="https://nutriflow.inf.br/patients/new" 
                 style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
                Cadastrar Primeiro Paciente →
              </a>
            </div>
            
            <p style="color: #a1a1aa; font-size: 14px; text-align: center; margin: 32px 0 0 0; padding-top: 24px; border-top: 1px solid #e4e4e7;">
              Precisa de ajuda? Responda este e-mail ou acesse nosso suporte.
            </p>
          </div>
          
          <p style="color: #a1a1aa; font-size: 12px; text-align: center; margin: 24px 0 0 0;">
            © ${new Date().getFullYear()} NutriFlow. Todos os direitos reservados.
          </p>
        </div>
      </body>
      </html>
    `;

    // Em modo de teste, envia para o email do dono da conta
    const recipientEmail = TEST_MODE ? TEST_EMAIL : email;
    
    console.log(`Sending email to: ${recipientEmail} (original: ${email}, TEST_MODE: ${TEST_MODE})`);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "NutriFlow <noreply@nutriflow.inf.br>",
        to: [recipientEmail],
        subject: TEST_MODE 
          ? `[TESTE] Email para ${email}: O app do seu paciente está esperando... 📱`
          : "O app do seu paciente está esperando... 📱",
        html: htmlContent,
      }),
    });

    const emailResponse = await res.json();

    if (!res.ok) {
      console.error("Resend API error:", emailResponse);
      throw new Error(emailResponse.message || "Failed to send email");
    }

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-nudge-email function:", error);
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
