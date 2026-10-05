# 🔧 VERCEL ENVIRONMENT VARIABLES - SETUP CORRETO

## ❌ Problema Atual
Você criou **Secrets** com nomes errados:
- `supabase_url` → deveria ser `VITE_SUPABASE_URL`
- Falta o prefixo `VITE_` que o Vite precisa

---

## ✅ Solução: Criar Environment Variables Corretas

### 1. Acesse Environment Variables
https://vercel.com/diascristiano-s-projects/nourish-bot-builder/settings/environment-variables

### 2. Adicione ESTAS variáveis (clique "Add Environment Variable"):

#### 🔹 Supabase (Obrigatório)
```
Key: VITE_SUPABASE_URL
Value: https://dummy.supabase.co
Environment: Production
Type: Plain Text (não Secret!)
```

```
Key: VITE_SUPABASE_ANON_KEY  
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Environment: Production
Type: Secret
```

#### 🔹 Stripe (Obrigatório)
```
Key: VITE_STRIPE_PUBLIC_KEY
Value: pk_test_51ULsgvIgAwz2mtIrDEo2AsX...
Environment: Production
Type: Plain Text
```

#### 🔹 Gemini AI (Opcional - se você tiver)
```
Key: VITE_GEMINI_API_KEY
Value: sua_chave_gemini_aqui
Environment: Production
Type: Secret
```

---

## 📋 Checklist Completo

### Passo 1: Deletar Secrets Antigos (Opcional)
- [x] Você já criou alguns, mas com nomes errados
- Pode deixar lá, vamos criar os corretos

### Passo 2: Adicionar Environment Variables
No painel Vercel → Settings → Environment Variables:

- [ ] VITE_SUPABASE_URL (Plain Text)
- [ ] VITE_SUPABASE_ANON_KEY (Secret)
- [ ] VITE_STRIPE_PUBLIC_KEY (Plain Text)
- [ ] VITE_GEMINI_API_KEY (Secret - opcional)

### Passo 3: Redeploy
Depois de adicionar TODAS as variáveis:
1. Vá em: Deployments → Latest → ⋯ (três pontos) → **Redeploy**
2. OU force novo deploy:
   ```bash
   git commit --allow-empty -m "trigger: fix env vars"
   git push
   ```

---

## 🎯 Diferença entre Secret e Plain Text

### Use **Secret** para:
- API Keys privadas (ANON_KEY, GEMINI_API_KEY)
- Tokens sensíveis
- Valores que não devem aparecer em logs

### Use **Plain Text** para:
- URLs públicas (SUPABASE_URL, STRIPE_PUBLIC_KEY)
- IDs de projeto
- Valores que já são públicos no frontend

---

## ✅ Valores Corretos (baseado nos seus prints)

```env
VITE_SUPABASE_URL=https://dummy.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_STRIPE_PUBLIC_KEY=pk_test_51ULsgvIgAwz2mtIrDEo2AsX2tfpZ4RDx6bTHrOmsAoWuHTtbziluuCoMkzDQLz1FBeiEvHxpoZ4cvpVFjAE5OxH900jhsbxmAx
```

---

## 🚀 Após Deploy Bem-Sucedido

Teste em: https://nutriflow.inf.br

Se aparecer erro de autenticação:
1. Abra DevTools (F12)
2. Console → veja se as variáveis estão definidas:
   ```js
   console.log(import.meta.env.VITE_SUPABASE_URL)
   ```

3. Se retornar `undefined` → variável não foi carregada
4. Se retornar a URL → está funcionando!

---

## 📞 Precisa de Ajuda?

1. Tire print da tela de Environment Variables com as 3 variáveis criadas
2. Mostre o erro do novo deploy (se houver)
3. Teste: `curl -I https://nutriflow.inf.br` (deve retornar 200 OK)
