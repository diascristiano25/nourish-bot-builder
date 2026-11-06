# Sistema de Automação de Email Marketing - NutriFlow

## Data
2026-11-05

## Status
Approved

## Contexto

O NutriFlow está em fase de aquisição de leads e não pode deixar usuários caírem no vazio após o cadastro. Atualmente:
- Edge functions de boas-vindas existem mas NÃO são invocadas no fluxo de cadastro
- Não há sistema de follow-up durante o trial de 33 dias
- Não há alertas de vencimento de trial
- Leads não recebem educação sobre features do produto

## Objetivo

Implementar sistema completo de email marketing automatizado que:
1. Conecta emails de boas-vindas existentes ao fluxo de cadastro
2. Envia follow-ups educativos durante o trial (dias 3, 7, 14, 21, 28)
3. Envia alertas de vencimento antes do trial expirar
4. Educa pacientes sobre uso do app

## Estratégia de Emails

### Fluxo de Nutricionistas (33 dias de trial)

**Dia 0 - Boas-vindas**
- Edge Function: `send-welcome-email` (já existe)
- Trigger: Após signup bem-sucedido em `useAuth.tsx`
- Conteúdo: Boas-vindas, próximos passos, convite para cadastrar primeiro paciente

**Dia 3 - Primeiro Paciente**
- Edge Function: `send-trial-followup-email` (nova)
- Conteúdo: Como cadastrar primeiro paciente, dicas de onboarding, benefícios de ter pacientes no app
- CTA: Botão para dashboard

**Dia 7 - Features Essenciais**
- Conteúdo: Plano alimentar, prescrições, acompanhamento de progresso
- CTA: Criar primeiro plano alimentar

**Dia 14 - Retenção de Pacientes**
- Conteúdo: Como usar relatórios, lembretes automáticos, diário alimentar
- CTA: Explorar relatórios

**Dia 21 - Cases de Sucesso**
- Conteúdo: Histórias de nutris que cresceram com o NutriFlow, benefícios premium
- CTA: Conhecer planos

**Dia 28 - Alerta de Vencimento**
- Conteúdo: 5 dias restantes, recap de benefícios, oferta especial (se houver)
- CTA: Fazer upgrade

**Dia 33 - Expiração**
- Conteúdo: Trial expirado, como continuar usando, benefícios de converter
- CTA: Assinar agora

### Fluxo de Pacientes

**Dia 0 - Boas-vindas**
- Edge Function: `send-patient-welcome-email` (já existe)
- Trigger: Após primeiro acesso em `PatientAuth.tsx`
- Conteúdo: Boas-vindas, como usar o app, próximos passos

**Dia 7 - Dicas de Uso**
- Conteúdo: Como registrar refeições, usar diário alimentar, acompanhar metas
- CTA: Abrir app

**Dia 14 - Features do App**
- Conteúdo: Diário alimentar, gráficos de progresso, comunicação com nutri
- CTA: Explorar features

## Arquitetura Técnica

### 1. Tabela `email_logs`

```sql
CREATE TABLE email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email_type TEXT NOT NULL, -- 'welcome', 'trial-day-3', 'trial-day-7', etc
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  INDEX idx_email_logs_user_id (user_id),
  INDEX idx_email_logs_type (email_type),
  INDEX idx_email_logs_sent_at (sent_at)
);
```

### 2. Nova Edge Function: `send-trial-followup-email`

**Input:**
```typescript
{
  user_id: string,
  email_type: 'trial-day-3' | 'trial-day-7' | 'trial-day-14' | 'trial-day-21' | 'trial-day-28' | 'trial-expired' | 'patient-day-7' | 'patient-day-14'
}
```

**Responsabilidades:**
- Buscar dados do usuário (nutritionists ou patients)
- Verificar se email já foi enviado (tabela email_logs)
- Buscar template HTML correspondente
- Enviar via Resend
- Registrar em email_logs

### 3. Nova Edge Function: `process-daily-trial-emails` (Cron Job)

**Agendamento:** Diariamente às 8h (via Supabase Cron)

**Lógica:**
```typescript
// 1. Buscar nutricionistas em trial
const nutritionists = await db.query(`
  SELECT 
    p.user_id,
    p.full_name,
    p.email,
    p.trial_start_date,
    EXTRACT(DAY FROM NOW() - p.trial_start_date) as days_in_trial
  FROM profiles p
  WHERE p.subscription_status = 'trial'
    AND p.trial_start_date IS NOT NULL
    AND p.trial_ended = false
`);

// 2. Para cada nutri, verificar se deve receber email hoje
for (const nutri of nutritionists) {
  const days = Math.floor(nutri.days_in_trial);
  const emailDays = [3, 7, 14, 21, 28, 33];
  
  if (emailDays.includes(days)) {
    const emailType = days === 33 ? 'trial-expired' : `trial-day-${days}`;
    
    // Verificar se já foi enviado
    const alreadySent = await db.query(`
      SELECT id FROM email_logs 
      WHERE user_id = $1 AND email_type = $2
    `, [nutri.user_id, emailType]);
    
    if (!alreadySent.length) {
      await supabase.functions.invoke('send-trial-followup-email', {
        body: { user_id: nutri.user_id, email_type: emailType }
      });
    }
  }
}

// 3. Repetir para pacientes (dias 7 e 14)
const patients = await db.query(`
  SELECT 
    p.user_id,
    p.full_name,
    p.email,
    p.created_at,
    EXTRACT(DAY FROM NOW() - p.created_at) as days_registered
  FROM patients p
  WHERE p.user_id IS NOT NULL
`);

for (const patient of patients) {
  const days = Math.floor(patient.days_registered);
  const emailDays = [7, 14];
  
  if (emailDays.includes(days)) {
    const emailType = `patient-day-${days}`;
    
    const alreadySent = await db.query(`
      SELECT id FROM email_logs 
      WHERE user_id = $1 AND email_type = $2
    `, [patient.user_id, emailType]);
    
    if (!alreadySent.length) {
      await supabase.functions.invoke('send-trial-followup-email', {
        body: { user_id: patient.user_id, email_type: emailType }
      });
    }
  }
}
```

### 4. Conectar Edge Functions ao Fluxo de Cadastro

**useAuth.tsx (Nutricionistas):**
```typescript
// Após signUp bem-sucedido
if (data.user) {
  await supabase.functions.invoke('send-welcome-email', {
    body: { user_id: data.user.id }
  });
}
```

**PatientAuth.tsx (Pacientes):**
```typescript
// Após signUp bem-sucedido
if (data.user) {
  await supabase.functions.invoke('send-patient-welcome-email', {
    body: { user_id: data.user.id, patient_id: patientData.id }
  });
}
```

### 5. Templates de Email

Todos os templates serão HTML responsivo otimizado para mobile, com:
- Header com logo NutriFlow
- Conteúdo personalizado (nome do usuário)
- CTAs claros e destacados
- Footer com unsubscribe
- Tracking pixels (opcional)

Templates serão armazenados inline na edge function `send-trial-followup-email` usando template literals com variáveis.

## Considerações de Segurança

- RESEND_API_KEY deve ser configurada como Secret no Supabase Dashboard (não hardcoded)
- Edge functions devem validar JWT do usuário
- Rate limiting para evitar spam
- Unsubscribe obrigatório em todos os emails

## Monitoramento

- Dashboard no Supabase mostrando emails enviados/abertos/clicados
- Alertas em caso de falha no envio
- Métricas de conversão (trial → paid)

## Rollback

Se algo der errado:
1. Desativar cron job `process-daily-trial-emails`
2. Desabilitar chamadas de email em `useAuth.tsx` e `PatientAuth.tsx`
3. Tabela `email_logs` pode ser limpa se necessário

## Próximos Passos

1. Criar migration para tabela `email_logs`
2. Implementar edge function `send-trial-followup-email` com todos os templates
3. Implementar edge function `process-daily-trial-emails` (cron)
4. Conectar `send-welcome-email` em `useAuth.tsx`
5. Conectar `send-patient-welcome-email` em `PatientAuth.tsx`
6. Configurar cron job no Supabase Dashboard
7. Testar fluxo completo com usuários de teste
8. Deploy e monitorar

## Critérios de Aceitação

- [ ] Email de boas-vindas enviado automaticamente após cadastro de nutri
- [ ] Email de boas-vindas enviado automaticamente após primeiro acesso de paciente
- [ ] Follow-ups enviados nos dias 3, 7, 14, 21, 28 do trial
- [ ] Alerta de expiração enviado no dia 33
- [ ] Pacientes recebem emails educativos nos dias 7 e 14
- [ ] Tabela `email_logs` registra todos os envios
- [ ] Cron job roda diariamente sem falhas
- [ ] Emails são responsivos e renderizam corretamente em mobile
- [ ] RESEND_API_KEY não está hardcoded em nenhum lugar
- [ ] Sistema de tracking registra aberturas e cliques