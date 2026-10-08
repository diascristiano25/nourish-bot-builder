## 🔥 SOLUÇÃO RÁPIDA - ERRO ANTHROPOMETRICS

### 🎯 CAUSA RAIZ
O erro "Could not find the table 'public.anthropometrics' in the schema cache" ocorre porque:
1. A tabela **existe no banco** ✅
2. Mas o **PostgREST (API do Supabase) não atualizou o cache** ❌

### ⚡ SOLUÇÃO IMEDIATA

**Execute ESTE SQL no Supabase SQL Editor:**

```sql
-- FORÇAR RELOAD DO SCHEMA CACHE
NOTIFY pgrst, 'reload schema';

-- Verificar se tabela existe
SELECT COUNT(*) FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'anthropometrics';

-- Verificar RLS
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'anthropometrics';
```

### 🔄 DEPOIS DE EXECUTAR

1. **Aguarde 10 segundos** (para o PostgREST recarregar)
2. **Recarregue a aplicação no navegador** (Ctrl+Shift+R)
3. **Faça logout e login novamente** (para renovar o token de autenticação)

---

### 🛠️ SE AINDA NÃO FUNCIONAR

Execute o SQL completo: [FIX-ANTHROPOMETRICS-CACHE.sql](FIX-ANTHROPOMETRICS-CACHE.sql)

Ou regenere os types:
```bash
npx supabase gen types typescript --project-id rwenbxqmfpvysxpplbqop > src/integrations/supabase/types.ts
```

---

### 📊 COMPONENTES QUE USAM ANTHROPOMETRICS

Estes componentes fazem queries na tabela:
- ✅ PatientMonitoringTab.tsx (linha 93)
- ✅ Consultation.tsx (linha 218)
- ✅ EditPatient.tsx (linhas 87, 189)
- ✅ GenerateMealPlan.tsx (linha 91)
- ✅ NewPatient.tsx (linha 152)
- ✅ PatientDetail.tsx (linhas 240, 277)

Todos precisam que a tabela esteja acessível via API do Supabase.
