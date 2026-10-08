# ✅ SOLUÇÃO: Confirmar Usuário no Supabase (Plano Free)

Como você não tem acesso ao service_role key no plano Free, use uma destas opções:

---

## 🎯 OPÇÃO 1: Desabilitar Confirmação de Email (RECOMENDADO)

### Passo a Passo:

1. **Acesse Authentication > Providers**
   - URL: https://supabase.com/dashboard/project/nwenbxqmfpyspxpibgwp/auth/providers

2. **Clique em "Email"** na lista de providers

3. **Procure "Confirm email"** e **desabilite** essa opção

4. **Clique em "Save"**

5. **Teste novamente:**
   ```bash
   npx tsx signup-test-user.ts
   ```

---

## 🎯 OPÇÃO 2: SQL Direto no Dashboard

1. **Acesse SQL Editor**
   - URL: https://supabase.com/dashboard/project/nwenbxqmfpyspxpibgwp/sql/new

2. **Cole e execute este SQL:**
   ```sql
   UPDATE auth.users
   SET
     email_confirmed_at = NOW(),
     confirmed_at = NOW()
   WHERE email = 'alguem@teste.com';
   
   -- Verificar
   SELECT id, email, email_confirmed_at, confirmed_at
   FROM auth.users
   WHERE email = 'alguem@teste.com';
   ```

3. **Teste o login:**
   ```bash
   npx tsx confirm-user-and-test.ts
   ```

---

## 🚀 Depois de Confirmar o Usuário

Execute para testar a Edge Function:
```bash
npx tsx confirm-user-and-test.ts
```

---

**💡 Qual opção você prefere usar?**
