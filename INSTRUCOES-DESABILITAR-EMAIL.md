# Como Desabilitar Confirmação de Email no Supabase

## Passo a Passo:

1. **Acesse Authentication > Providers**
   https://supabase.com/dashboard/project/nwenbxqmfpyspxpibgwp/auth/providers

2. **Clique em "Email" na lista de providers**

3. **Desabilite "Confirm email"**
   - Procure pela opção "Confirm email" 
   - Desmarque/desabilite essa opção
   - Clique em "Save"

4. **Teste novamente o signup**
   ```bash
   npx tsx signup-test-user.ts
   ```

## Alternativa: Usar SQL direto

Se preferir, posso criar um script que usa SQL direto para confirmar o usuário automaticamente via Database.

**Qual você prefere?**
- A) Desabilitar confirmação de email no dashboard (mais simples)
- B) Script SQL para confirmar usuários existentes
