# Configurar Grupo do Google Workspace como Remetente no Resend

Este guia permite usar um **Grupo do Google Workspace** (ex: `noreply@nutriflow.inf.br`) como endereço de envio transacional, sem precisar criar uma licença de usuário dedicada.

---

## 1. Criar o Grupo no Google Admin Console

1. Acesse [admin.google.com](https://admin.google.com) → **Diretório** → **Grupos**
2. Clique em **Criar grupo**
3. Preencha:
   - **Nome:** NutriFlow Transacional
   - **Email do grupo:** `noreply@nutriflow.inf.br` (ou `suporte@`, `contato@`)
   - **Descrição:** Emails automáticos do sistema NutriFlow
4. Em **Configurações de acesso**:
   - Quem pode postar no grupo: **Apenas proprietários e gerentes** (segurança)
   - Quem pode ver os membros: **Apenas proprietários e gerentes**
5. Salve o grupo

> 💡 Grupos são gratuitos e ilimitados no Google Workspace. Não consomem licença.

---

## 2. Adicionar Membros ao Grupo (Opcional)

Se quiser receber cópias ou respostas dos emails transacionais:

1. No grupo criado, vá em **Membros** → **Adicionar membros**
2. Adicione os emails reais que devem receber as mensagens (ex: `cristiano@nutriflow.inf.br`)
3. Defina a função como **Membro** (apenas leitura)

> ⚠️ Se o grupo for apenas para envio (noreply), você pode deixar sem membros. O Resend envia diretamente via API, não precisa do grupo "receber" nada.

---

## 3. Verificar o Domínio no Resend

1. Acesse [resend.com/domains](https://resend.com/domains) → **Add Domain**
2. Digite `nutriflow.inf.br`
3. O Resend mostrará os registros DNS necessários:

| Tipo | Nome | Valor |
|------|------|-------|
| TXT | `@` | `v=spf1 include:_spf.google.com include:resend._spf.google.com ~all` |
| CNAME | `resend._domainkey` | `resend._domainkey.resend.com` |
| TXT | `_dmarc` | `v=DMARC1; p=quarantine; rua=mailto:dmarc@nutriflow.inf.br` |

4. Adicione esses registros em **Google Admin Console → Domínios → Gerenciar domínios → Registros DNS**
5. Volte ao Resend e clique em **Verify**

> ⏱️ Propagação: até 48h. Normalmente funciona em minutos.

---

## 4. Configurar o SPF Corretamente (Crítico)

Como você usa Google Workspace + Resend, o SPF deve incluir **ambos**:

```
v=spf1 include:_spf.google.com include:resend._spf.google.com ~all
```

- `include:_spf.google.com` → autoriza o Gmail/Workspace a enviar
- `include:resend._spf.google.com` → autoriza o Resend a enviar pelo seu domínio

> ❌ **Erro comum:** substituir um pelo outro. Isso causa falha de entrega ou spam.

---

## 5. Atualizar as Edge Functions

Todas as funções já usam `noreply@nutriflow.inf.br` como remetente:

- ✅ `send-welcome-email` — boas-vindas nutricionista
- ✅ `send-patient-welcome-email` — boas-vindas paciente
- ✅ `send-nudge-email` — lembrete primeiro paciente
- ✅ `send-appointment-reminders` — lembrete consulta

Nenhuma alteração de código é necessária. O Resend aceita qualquer endereço local do domínio verificado.

---

## 6. Testar o Envio

```bash
curl -X POST https://fqeruutxahrrxjusxndl.supabase.co/functions/v1/send-welcome-email \
  -H "Content-Type: application/json" \
  -d '{"email": "seu@email.com", "name": "Teste"}'
```

Verifique:
- [ ] Email chegou na caixa de entrada (não spam)
- [ ] Remetente mostra `noreply@nutriflow.inf.br`
- [ ] Cabeçalhos SPF/DKIM passaram (verifique em "Mostrar original" no Gmail)

---

## Resumo da Arquitetura

```
Google Workspace                    Resend                      Destinatário
┌─────────────────┐              ┌──────────────┐            ┌─────────────┐
│ Grupo:          │   DNS/SPF    │ API Resend   │   SMTP     │ Paciente /  │
│ noreply@        │◄────────────►│ Envia como   │───────────►│ Nutricionista│
│ nutriflow.inf.br│   verifica   │ noreply@     │            │             │
│ (sem licença)   │   domínio    │ nutriflow... │            │             │
└─────────────────┘              └──────────────┘            └─────────────┘
```

**Custo:** R$ 0,00 adicional. Grupos são gratuitos. Resend tem plano gratuito de 3.000 emails/mês.

---

## Checklist Final

- [ ] Grupo criado no Google Admin Console
- [ ] Registros SPF/DKIM/DMARC adicionados no DNS
- [ ] Domínio verificado no painel do Resend
- [ ] SPF inclui tanto `_spf.google.com` quanto `resend._spf.google.com`
- [ ] Email de teste enviado e recebido com sucesso
- [ ] Trigger SQL executado no Supabase (ver `email-templates-setup.md`)