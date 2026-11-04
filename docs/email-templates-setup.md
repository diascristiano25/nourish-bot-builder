# Configuração de Emails Transacionais - NutriFlow

## Visão Geral

O NutriFlow utiliza **Resend** como provedor de emails transacionais com domínio próprio (`nutriflow.inf.br`) configurado no Google Workspace.

### Emails Implementados

| Email | Gatilho | Status |
|-------|---------|--------|
| Boas-vindas (Nutricionista) | Trigger `on_auth_user_created` | ✅ Edge Function criada |
| Reset de Senha | Supabase Auth nativo | ⚠️ Customizar template |
| Confirmação de Email | Supabase Auth nativo | ⚠️ Customizar template |
| Magic Link (Paciente) | `send-patient-magic-link` | ✅ Funcionando |
| Lembrete de Consulta | Cron `send-appointment-reminders` | ✅ Funcionando |
| Nudge (Primeiro Paciente) | Manual/Agendado | ✅ Funcionando |

---

## 1. Configurar DNS no Google Workspace

Antes de qualquer email funcionar com domínio próprio, configure estes registros no **Google Admin Console > Domínios > Gerenciar domínios > Registros DNS**:

### Registros SPF/DKIM/DMARC do Resend

Acesse [resend.com/domains](https://resend.com/domains) e adicione seu domínio `nutriflow.inf.br`. O Resend fornecerá:

```
Tipo    Nome                    Valor
TXT     @                       v=spf1 include:resend._spf.google.com ~all
CNAME   resend._domainkey       resend._domainkey.resend.com
TXT     _dmarc                  v=DMARC1; p=quarantine; rua=mailto:dmarc@nutriflow.inf.br
```

> ⏱️ A propagação pode levar até 48h. Verifique o status no painel do Resend.

---

## 2. Trigger de Boas-Vindas (SQL)

Execute este SQL no **Supabase Dashboard > SQL Editor** para enviar automaticamente o email de boas-vindas quando um novo nutricionista se cadastra:

```sql
-- Função que dispara a Edge Function de boas-vindas
CREATE OR REPLACE FUNCTION public.send_welcome_email_on_signup()
RETURNS TRIGGER AS $$
BEGIN
  -- Apenas para novos usuários que NÃO são pacientes
  IF NEW.raw_user_meta_data->>'is_patient' IS NULL 
     OR NEW.raw_user_meta_data->>'is_patient' != 'true' THEN
    
    PERFORM net.http_post(
      url := 'https://fqeruutxahrrxjusxndl.supabase.co/functions/v1/send-welcome-email',
      headers := '{"Content-Type": "application/json"}'::jsonb,
      body := jsonb_build_object(
        'email', NEW.email,
        'name', COALESCE(NEW.raw_user_meta_data->>'full_name', 'Nutricionista')
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger na tabela auth.users
DROP TRIGGER IF EXISTS on_auth_user_created_send_welcome ON auth.users;
CREATE TRIGGER on_auth_user_created_send_welcome
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.send_welcome_email_on_signup();
```

> ⚠️ **Importante:** Substitua `fqeruutxahrrxjusxndl` pelo seu Project ID real se diferente.

---

## 3. Customizar Templates do Supabase Auth

Os emails de **Reset de Senha** e **Confirmação de Email** são enviados diretamente pelo Supabase Auth. Para customizá-los com a identidade visual do NutriFlow:

### Acesse no Dashboard

1. Vá em **Authentication > Email Templates**
2. Selecione o template desejado
3. Substitua o HTML padrão pelo template customizado abaixo

### Template: Reset de Senha

```html
<h2>Redefinir sua senha</h2>
<p>Olá!</p>
<p>Clique no botão abaixo para redefinir sua senha:</p>
<a href="{{ .SiteURL }}/auth?token={{ .TokenHash }}&type=recovery">Redefinir Senha</a>
<p>Se você não solicitou esta alteração, ignore este email.</p>
<p>— Equipe NutriFlow 🥗</p>
```

### Template: Confirmação de Email

```html
<h2>Confirme seu email</h2>
<p>Olá! Bem-vindo ao NutriFlow.</p>
<p>Clique abaixo para confirmar seu endereço de email:</p>
<a href="{{ .ConfirmationURL }}">Confirmar Email</a>
<p>— Equipe NutriFlow 🥗</p>
```

> 💡 Use as variáveis `{{ .SiteURL }}`, `{{ .TokenHash }}`, `{{ .ConfirmationURL }}` conforme documentação do Supabase.

---

## 4. Variáveis de Ambiente Necessárias

Certifique-se de que estas variáveis estão configuradas no **Supabase Dashboard > Settings > Environment Variables**:

```
RESEND_API_KEY=re_xxxxxxxxxxxxx
SUPABASE_URL=https://fqeruutxahrrxjusxndl.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 5. Teste Rápido

Para testar a função de boas-vindas manualmente:

```bash
curl -X POST https://fqeruutxahrrxjusxndl.supabase.co/functions/v1/send-welcome-email \
  -H "Content-Type: application/json" \
  -d '{"email": "seu@email.com", "name": "Seu Nome"}'
```

---

## Próximos Passos

- [ ] Configurar registros DNS no Google Admin Console
- [ ] Verificar domínio no painel do Resend
- [ ] Executar SQL do trigger no Supabase
- [ ] Customizar templates de Reset e Confirmação
- [ ] Testar fluxo completo de signup → email de boas-vindas