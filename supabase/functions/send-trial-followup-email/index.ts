import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TrialFollowupRequest {
  user_id: string;
  email_type: string;
}

interface ActivationStats {
  patients: number;
  plans: number;
}

function activationLayout(opts: { firstName: string; heading: string; paragraphs: string[]; cta: string; url: string }): string {
  const paragraphs = opts.paragraphs
    .map((p) => `<p style="color: #52525b; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">${p}</p>`)
    .join("");
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 16px 16px 0 0; padding: 28px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 26px; font-weight: 600;">🥗 NutriFlow</h1>
        </div>
        <div style="background: white; padding: 36px 32px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <h2 style="color: #18181b; margin: 0 0 16px 0; font-size: 22px;">${opts.heading}</h2>
          ${paragraphs}
          <div style="text-align: center; margin: 32px 0 8px 0;">
            <a href="${opts.url}" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600;">${opts.cta}</a>
          </div>
          <p style="color: #a1a1aa; font-size: 14px; text-align: center; margin: 28px 0 0 0; padding-top: 20px; border-top: 1px solid #e4e4e7;">
            Travou em algum ponto? É só responder este e-mail que a gente te ajuda.
          </p>
        </div>
      </div>
    </body>
    </html>`;
}

function getActivationTemplate(emailType: string, firstName: string, stats: ActivationStats): { subject: string; html: string } | null {
  switch (emailType) {
    case "activation-no-patient":
      return {
        subject: `${firstName}, cadastre seu primeiro paciente em 1 minuto`,
        html: activationLayout({
          firstName,
          heading: `Olá, ${firstName}! 👋`,
          paragraphs: [
            "Vimos que sua conta já está pronta, mas você ainda não cadastrou nenhum paciente.",
            "Leva cerca de 1 minuto: nome, data de nascimento, peso e altura. Com isso o NutriFlow já calcula TMB e gasto energético e deixa tudo pronto para gerar o plano alimentar com IA.",
          ],
          cta: "Cadastrar meu primeiro paciente →",
          url: "https://nutriflow.inf.br/novo-paciente",
        }),
      };
    case "activation-no-plan":
      return {
        subject: `${firstName}, falta só gerar o plano alimentar`,
        html: activationLayout({
          firstName,
          heading: `Falta pouco, ${firstName}! 🚀`,
          paragraphs: [
            "Você já cadastrou seu paciente. O próximo passo é o que mais economiza seu tempo: gerar o plano alimentar com IA.",
            "Em poucos segundos sai um cardápio completo, que você ajusta do seu jeito e envia ao paciente em PDF ou pelo portal.",
          ],
          cta: "Gerar meu primeiro plano →",
          url: "https://nutriflow.inf.br/pacientes",
        }),
      };
    case "trial-last-day": {
      const used: string[] = [];
      if (stats.patients > 0) used.push(`${stats.patients} paciente${stats.patients > 1 ? "s" : ""} cadastrado${stats.patients > 1 ? "s" : ""}`);
      if (stats.plans > 0) used.push(`${stats.plans} plano${stats.plans > 1 ? "s" : ""} alimentar${stats.plans > 1 ? "es" : ""} criado${stats.plans > 1 ? "s" : ""}`);
      const personal = used.length
        ? `Até agora você tem ${used.join(" e ")} no NutriFlow. Para não perder esse trabalho nem o acesso, escolha seu plano.`
        : "Seu período de teste termina amanhã. Ainda dá tempo de cadastrar um paciente e gerar um plano com IA para ver o resultado na prática.";
      return {
        subject: "Seu teste do NutriFlow termina amanhã",
        html: activationLayout({
          firstName,
          heading: `Olá, ${firstName}! ⏳`,
          paragraphs: [personal, "Seus dados ficam guardados e você continua de onde parou ao assinar."],
          cta: used.length ? "Escolher meu plano →" : "Usar antes de acabar →",
          url: used.length ? "https://nutriflow.inf.br/assinatura" : "https://nutriflow.inf.br/dashboard",
        }),
      };
    }
    default:
      return null;
  }
}

function getTemplate(emailType: string, firstName: string, stats: ActivationStats = { patients: 0, plans: 0 }): { subject: string; html: string } {
  const activation = getActivationTemplate(emailType, firstName, stats);
  if (activation) return activation;
  const templates: Record<string, { subject: string; html: string }> = {
    "trial-day-3": {
      subject: "Seu primeiro paciente no NutriFlow 🎯",
      html: `
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
              <h2 style="color: #18181b; margin: 0 0 16px 0; font-size: 22px;">Olá, ${firstName}! 👋</h2>

              <p style="color: #52525b; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                Já faz 3 dias que você começou sua jornada no NutriFlow! Que tal dar o próximo passo e cadastrar seu primeiro paciente?
              </p>

              <div style="background: #f0fdf4; padding: 16px 20px; margin: 24px 0; border-radius: 8px;">
                <p style="color: #166534; margin: 0; font-size: 15px; font-weight: 500;">
                  💡 Ter pacientes cadastrados é o primeiro passo para transformar sua rotina e oferecer um acompanhamento muito mais eficiente.
                </p>
              </div>

              <h3 style="color: #18181b; margin: 32px 0 16px 0; font-size: 18px;">Benefícios de ter seus pacientes no app:</h3>

              <ul style="color: #52525b; font-size: 15px; line-height: 2; padding-left: 20px; margin: 0 0 32px 0;">
                <li>✅ Histórico completo de cada paciente em um só lugar</li>
                <li>✅ Planos alimentares personalizados gerados por IA</li>
                <li>✅ Acompanhamento de evolução em tempo real</li>
                <li>✅ Comunicação direta e organizada</li>
              </ul>

              <div style="text-align: center; margin: 32px 0;">
                <a href="https://nutriflow.inf.br/dashboard"
                   style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
                  Acessar Dashboard →
                </a>
              </div>

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
      `,
    },
    "trial-day-7": {
      subject: "Features essenciais para sua rotina ⚡",
      html: `
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
              <h2 style="color: #18181b; margin: 0 0 16px 0; font-size: 22px;">Olá, ${firstName}! 🚀</h2>

              <p style="color: #52525b; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                Uma semana de NutriFlow! Você já conhece as features que vão revolucionar sua prática clínica?
              </p>

              <div style="background: #f0fdf4; padding: 16px 20px; margin: 24px 0; border-radius: 8px;">
                <p style="color: #166534; margin: 0; font-size: 15px; font-weight: 500;">
                  💡 Essas ferramentas foram desenvolvidas para economizar seu tempo e melhorar os resultados dos seus pacientes.
                </p>
              </div>

              <h3 style="color: #18181b; margin: 32px 0 16px 0; font-size: 18px;">Features que você precisa conhecer:</h3>

              <ul style="color: #52525b; font-size: 15px; line-height: 2; padding-left: 20px; margin: 0 0 32px 0;">
                <li>📋 <strong>Planos alimentares:</strong> Gere dietas personalizadas com IA em segundos</li>
                <li>📝 <strong>Receitas automáticas:</strong> Envie receitas e listas de compras prontas</li>
                <li>📊 <strong>Acompanhamento de progresso:</strong> Veja a evolução dos seus pacientes em gráficos</li>
                <li>💬 <strong>Diário alimentar:</strong> Seus pacientes registram tudo que comem</li>
              </ul>

              <div style="text-align: center; margin: 32px 0;">
                <a href="https://nutriflow.inf.br/meal-plans/new"
                   style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
                  Criar Plano Alimentar →
                </a>
              </div>

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
      `,
    },
    "trial-day-14": {
      subject: "Retenção de pacientes: como o NutriFlow ajuda 📈",
      html: `
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
              <h2 style="color: #18181b; margin: 0 0 16px 0; font-size: 22px;">Olá, ${firstName}! 🎯</h2>

              <p style="color: #52525b; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                Duas semanas usando o NutriFlow! Agora é hora de focar no que realmente importa: manter seus pacientes engajados e obtendo resultados.
              </p>

              <div style="background: #f0fdf4; padding: 16px 20px; margin: 24px 0; border-radius: 8px;">
                <p style="color: #166534; margin: 0; font-size: 15px; font-weight: 500;">
                  💡 A retenção de pacientes aumenta quando eles veem resultados claros e têm uma experiência organizada.
                </p>
              </div>

              <h3 style="color: #18181b; margin: 32px 0 16px 0; font-size: 18px;">Como o NutriFlow ajuda na retenção:</h3>

              <ul style="color: #52525b; font-size: 15px; line-height: 2; padding-left: 20px; margin: 0 0 32px 0;">
                <li>📊 <strong>Relatórios detalhados:</strong> Mostre resultados concretos aos seus pacientes</li>
                <li>🔔 <strong>Lembretes automáticos:</strong> Mantenha os pacientes ativos sem esforço manual</li>
                <li>📱 <strong>Diário alimentar:</strong> Engajamento diário com registro de refeições</li>
                <li>📧 <strong>Comunicação integrada:</strong> Tudo organizado em um só lugar</li>
              </ul>

              <div style="text-align: center; margin: 32px 0;">
                <a href="https://nutriflow.inf.br/reports"
                   style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
                  Explorar Relatórios →
                </a>
              </div>

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
      `,
    },
    "trial-day-21": {
      subject: "Cases de sucesso e benefícios premium ⭐",
      html: `
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
              <h2 style="color: #18181b; margin: 0 0 16px 0; font-size: 22px;">Olá, ${firstName}! 🌟</h2>

              <p style="color: #52525b; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                Três semanas de NutriFlow! Nutricionistas que usam nossa plataforma relatam aumento de até 40% na retenção de pacientes e economia de 15 horas semanais.
              </p>

              <div style="background: #f0fdf4; padding: 16px 20px; margin: 24px 0; border-radius: 8px;">
                <p style="color: #166534; margin: 0; font-size: 15px; font-weight: 500;">
                  💡 Profissionais que migram para o plano Premium dobram sua capacidade de atendimento sem aumentar a carga horária.
                </p>
              </div>

              <h3 style="color: #18181b; margin: 32px 0 16px 0; font-size: 18px;">Benefícios do plano Premium:</h3>

              <ul style="color: #52525b; font-size: 15px; line-height: 2; padding-left: 20px; margin: 0 0 32px 0;">
                <li>⭐ Pacientes ilimitados</li>
                <li>⭐ Relatórios avançados com exportação PDF</li>
                <li>⭐ Templates personalizados de planos alimentares</li>
                <li>⭐ Suporte prioritário</li>
                <li>⭐ Integração com balanças inteligentes</li>
              </ul>

              <div style="text-align: center; margin: 32px 0;">
                <a href="https://nutriflow.inf.br/plans"
                   style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
                  Ver Planos →
                </a>
              </div>

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
      `,
    },
    "trial-day-28": {
      subject: "⏰ Seu trial expira em 5 dias!",
      html: `
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
              <h2 style="color: #18181b; margin: 0 0 16px 0; font-size: 22px;">Olá, ${firstName}! ⏳</h2>

              <p style="color: #52525b; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                Seu período de teste está chegando ao fim! Faltam apenas 5 dias para continuar aproveitando todos os benefícios do NutriFlow.
              </p>

              <div style="background: #fef3c7; padding: 16px 20px; margin: 24px 0; border-radius: 8px;">
                <p style="color: #92400e; margin: 0; font-size: 15px; font-weight: 500;">
                  ⚠️ Após o término do trial, você não poderá mais criar novos planos alimentares ou acessar relatórios avançados.
                </p>
              </div>

              <h3 style="color: #18181b; margin: 32px 0 16px 0; font-size: 18px;">Recapitulando o que você conquistou:</h3>

              <ul style="color: #52525b; font-size: 15px; line-height: 2; padding-left: 20px; margin: 0 0 32px 0;">
                <li>✅ Economia de até 15 horas semanais</li>
                <li>✅ Planos alimentares gerados por IA</li>
                <li>✅ Acompanhamento em tempo real</li>
                <li>✅ Comunicação organizada com pacientes</li>
                <li>✅ Relatórios profissionais</li>
              </ul>

              <div style="text-align: center; margin: 32px 0;">
                <a href="https://nutriflow.inf.br/upgrade"
                   style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
                  Fazer Upgrade Agora →
                </a>
              </div>

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
      `,
    },
    "trial-expired": {
      subject: "Seu trial do NutriFlow expirou",
      html: `
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
              <h2 style="color: #18181b; margin: 0 0 16px 0; font-size: 22px;">Olá, ${firstName}! 💙</h2>

              <p style="color: #52525b; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                Seu período de teste do NutriFlow chegou ao fim. Esperamos que tenha gostado de experimentar nossa plataforma!
              </p>

              <div style="background: #fee2e2; padding: 16px 20px; margin: 24px 0; border-radius: 8px;">
                <p style="color: #991b1b; margin: 0; font-size: 15px; font-weight: 500;">
                  🔒 Sua conta está agora em modo limitado. Para desbloquear todas as funcionalidades, escolha um dos nossos planos.
                </p>
              </div>

              <h3 style="color: #18181b; margin: 32px 0 16px 0; font-size: 18px;">Como continuar sua jornada:</h3>

              <ul style="color: #52525b; font-size: 15px; line-height: 2; padding-left: 20px; margin: 0 0 32px 0;">
                <li>📋 Escolha o plano ideal para seu consultório</li>
                <li>💳 Ative sua assinatura com segurança</li>
                <li>🚀 Continue atendendo seus pacientes sem interrupção</li>
                <li>📊 Acesse todos os recursos premium</li>
              </ul>

              <div style="text-align: center; margin: 32px 0;">
                <a href="https://nutriflow.inf.br/subscribe"
                   style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
                  Assinar Agora →
                </a>
              </div>

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
      `,
    },
    "patient-day-7": {
      subject: "Dicas para aproveitar seu acompanhamento 📱",
      html: `
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
              <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">Seu companheiro de saúde</p>
            </div>

            <div style="background: white; padding: 40px 32px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
              <h2 style="color: #18181b; margin: 0 0 16px 0; font-size: 22px;">Olá, ${firstName}! 🌱</h2>

              <p style="color: #52525b; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                Uma semana de acompanhamento! Aqui estão algumas dicas para você tirar o máximo proveito do NutriFlow.
              </p>

              <div style="background: #f0fdf4; padding: 16px 20px; margin: 24px 0; border-radius: 8px;">
                <p style="color: #166534; margin: 0; font-size: 15px; font-weight: 500;">
                  💡 Quanto mais você registra, melhores são os insights do seu nutricionista!
                </p>
              </div>

              <h3 style="color: #18181b; margin: 32px 0 16px 0; font-size: 18px;">Dicas para esta semana:</h3>

              <ul style="color: #52525b; font-size: 15px; line-height: 2; padding-left: 20px; margin: 0 0 32px 0;">
                <li>📝 <strong>Registre suas refeições:</strong> Anote tudo que come, incluindo lanches</li>
                <li>📸 <strong>Fotos das refeições:</strong> Tire fotos para ajudar no controle</li>
                <li>🎯 <strong>Acompanhe suas metas:</strong> Veja seu progresso diariamente</li>
                <li>💬 <strong>Comunique-se:</strong> Tire dúvidas direto com seu nutricionista</li>
              </ul>

              <div style="text-align: center; margin: 32px 0;">
                <a href="https://nutriflow.inf.br/app"
                   style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
                  Abrir App →
                </a>
              </div>

              <p style="color: #a1a1aa; font-size: 14px; text-align: center; margin: 32px 0 0 0; padding-top: 24px; border-top: 1px solid #e4e4e7;">
                Este é um e-mail automático. Para suporte, responda esta mensagem.
              </p>
            </div>

            <p style="color: #a1a1aa; font-size: 12px; text-align: center; margin: 24px 0 0 0;">
              © ${new Date().getFullYear()} NutriFlow. Todos os direitos reservados.
            </p>
          </div>
        </body>
        </html>
      `,
    },
    "patient-day-14": {
      subject: "Explore tudo que o NutriFlow oferece 🚀",
      html: `
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
              <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">Seu companheiro de saúde</p>
            </div>

            <div style="background: white; padding: 40px 32px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
              <h2 style="color: #18181b; margin: 0 0 16px 0; font-size: 22px;">Olá, ${firstName}! ✨</h2>

              <p style="color: #52525b; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                Duas semanas de jornada! Você já descobriu todas as ferramentas disponíveis para tornar sua alimentação mais saudável e divertida?
              </p>

              <div style="background: #f0fdf4; padding: 16px 20px; margin: 24px 0; border-radius: 8px;">
                <p style="color: #166534; margin: 0; font-size: 15px; font-weight: 500;">
                  💡 Explore todas as funcionalidades e veja como elas podem transformar seus hábitos!
                </p>
              </div>

              <h3 style="color: #18181b; margin: 32px 0 16px 0; font-size: 18px;">Funcionalidades para explorar:</h3>

              <ul style="color: #52525b; font-size: 15px; line-height: 2; padding-left: 20px; margin: 0 0 32px 0;">
                <li>📱 <strong>Diário alimentar completo:</strong> Registre refeições, hidratação e exercícios</li>
                <li>📊 <strong>Gráficos de progresso:</strong> Acompanhe sua evolução visualmente</li>
                <li>💬 <strong>Chat com nutricionista:</strong> Tire dúvidas rapidamente</li>
                <li>📋 <strong>Receitas saudáveis:</strong> Descubra novas opções deliciosas</li>
                <li>🎯 <strong>Metas personalizadas:</strong> Defina e acompanhe seus objetivos</li>
              </ul>

              <div style="text-align: center; margin: 32px 0;">
                <a href="https://nutriflow.inf.br/app/features"
                   style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
                  Explorar Funcionalidades →
                </a>
              </div>

              <p style="color: #a1a1aa; font-size: 14px; text-align: center; margin: 32px 0 0 0; padding-top: 24px; border-top: 1px solid #e4e4e7;">
                Este é um e-mail automático. Para suporte, responda esta mensagem.
              </p>
            </div>

            <p style="color: #a1a1aa; font-size: 12px; text-align: center; margin: 24px 0 0 0;">
              © ${new Date().getFullYear()} NutriFlow. Todos os direitos reservados.
            </p>
          </div>
        </body>
        </html>
      `,
    },
  };

  return templates[emailType] || { subject: "", html: "" };
}

const handler = async (req: Request): Promise<Response> => {
  console.log("send-trial-followup-email function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, email_type }: TrialFollowupRequest = await req.json();

    if (!user_id || !email_type) {
      throw new Error("user_id and email_type are required");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Determine table based on email_type prefix
    const isPatient = email_type.startsWith("patient-");
    const tableName = isPatient ? "patients" : "profiles";

    // Query user data
    let userData;
    let profileId: string | null = null;
    if (isPatient) {
      const { data, error } = await supabase
        .from("patients")
        .select("email, full_name")
        .eq("user_id", user_id)
        .single();

      if (error || !data) {
        return new Response(
          JSON.stringify({ success: false, error: "Patient not found" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }
      userData = data;
    } else {
      // profiles has no email column; it lives in auth.users
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("user_id", user_id)
        .single();
      const { data: authEmails } = await supabase.rpc("get_auth_emails", { user_ids: [user_id] });
      const authEmail = authEmails?.[0]?.email;

      if (error || !data || !authEmail) {
        return new Response(
          JSON.stringify({ success: false, error: "User not found" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }
      userData = { email: authEmail, full_name: data.full_name };
      profileId = data.id;
    }

    const { email, full_name } = userData;
    const firstName = full_name?.split(" ")[0] || "Usuário";

    // Idempotency check
    const { data: existingLog } = await supabase
      .from("email_logs")
      .select("id")
      .eq("user_id", user_id)
      .eq("email_type", email_type)
      .single();

    if (existingLog) {
      console.log(`Email already sent for user_id=${user_id}, email_type=${email_type}`);
      return new Response(
        JSON.stringify({ success: true, already_sent: true }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Get template
    const stats: ActivationStats = { patients: 0, plans: 0 };
    if (profileId && email_type === "trial-last-day") {
      const [patients, plans] = await Promise.all([
        supabase.from("patients").select("id", { count: "exact", head: true }).eq("nutritionist_id", profileId),
        supabase.from("meal_plans").select("id", { count: "exact", head: true }).eq("nutritionist_id", profileId),
      ]);
      stats.patients = patients.count ?? 0;
      stats.plans = plans.count ?? 0;
    }
    const template = getTemplate(email_type, firstName, stats);

    if (!template.subject || !template.html) {
      throw new Error(`Invalid email_type: ${email_type}`);
    }

    // Send via Resend
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "NutriFlow <noreply@nutriflow.inf.br>",
        to: [email],
        subject: template.subject,
        html: template.html,
      }),
    });

    const emailResponse = await res.json();

    if (!res.ok) {
      console.error("Resend API error:", emailResponse);
      throw new Error(emailResponse.message || "Failed to send email");
    }

    // Log the email
    await supabase.from("email_logs").insert({
      user_id,
      email_type,
      metadata: { email_id: emailResponse.id },
    });

    console.log(`Trial followup email sent successfully to ${email}`);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-trial-followup-email function:", error);
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