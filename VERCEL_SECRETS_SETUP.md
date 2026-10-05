# 🔐 CONFIGURAR SECRETS NO GITHUB - URGENTE!

## O deploy automático NÃO VAI FUNCIONAR sem essas secrets!

### PASSO 1: Pegar as informações da Vercel

1. Acesse: https://vercel.com/account/tokens
2. Crie um novo token: **"Deploy Token"**
3. Copie o token (só mostra uma vez!)

### PASSO 2: Pegar IDs do projeto

Execute no terminal:

```bash
cd C:\Claudin\Nutriflow
npx vercel link
npx vercel env pull .env.vercel
cat .vercel/project.json
```

Vai mostrar algo como:
```json
{
  "orgId": "team_XXXXX",
  "projectId": "prj_XXXXX"
}
```

### PASSO 3: Adicionar no GitHub

1. Vá em: https://github.com/diascristiano25/nourish-bot-builder/settings/secrets/actions
2. Clique em **"New repository secret"**
3. Adicione 3 secrets:

   **Secret 1:**
   - Name: `VERCEL_TOKEN`
   - Value: [O token que você copiou]

   **Secret 2:**
   - Name: `VERCEL_ORG_ID`
   - Value: [O orgId do .vercel/project.json]

   **Secret 3:**
   - Name: `VERCEL_PROJECT_ID`
   - Value: [O projectId do .vercel/project.json]

### PASSO 4: Testar

Depois de adicionar as secrets:
1. Faça qualquer commit e push
2. Vá em: https://github.com/diascristiano25/nourish-bot-builder/actions
3. Veja o deploy rodando automaticamente!

---

## ⚠️ IMPORTANTE:
O deploy só funciona DEPOIS de adicionar essas 3 secrets!
