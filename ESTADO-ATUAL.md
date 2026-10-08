# 📊 ESTADO ATUAL DO NUTRIFLOW - 08/10/2026

## 🎯 RESUMO EXECUTIVO

Projeto NutriFlow SaaS continuando após limite de contexto da sessão anterior.
Verificando estado real do banco de dados e código antes de prosseguir.

---

## 📁 ARQUIVOS NÃO COMMITADOS

```
fix-name-to-fullname.sql       - Script para renomear coluna name → full_name
fix-remove-name-column.sql     - Script para remover coluna name duplicada
```

**Status:** Você informou que executou os SQLs. Preciso verificar o banco real.

---

## 🗄️ SCHEMA DO BANCO (src/integrations/supabase/types.ts)

### ✅ Tabela `patients` - ESTRUTURA CORRETA
```typescript
Row: {
  activity_level: Database["public"]["Enums"]["activity_level"] | null  ✅
  allergies: string[] | null
  birth_date: string | null
  created_at: string
  critical_tags: string[] | null
  dietary_restrictions: string[] | null
  email: string | null
  full_name: string                                                      ✅
  gender: string | null
  goal: Database["public"]["Enums"]["patient_goal"] | null
  id: string
  medical_conditions: string | null
  notes: string | null
  nutritionist_id: string
  phone: string | null
  updated_at: string
  user_id: string | null
}
```

**✅ Coluna correta:** `full_name` (não `name`)
**✅ Campo correto:** `activity_level` existe no tipo

### ✅ Tabela `custom_recipes` - EXISTE
```typescript
custom_recipes: {
  Row: {
    created_at: string
    estimated_macros: Json | null
    id: string
    ingredients: Json | null
    name: string
    notes: string | null
    nutritionist_id: string
    updated_at: string
  }
}
```

**✅ Tabela existe:** Criada na migration `20251217031254_df992455-3705-48e9-93e0-094534dd0468.sql`

---

## 🛣️ ROTAS PRINCIPAIS

### ✅ Rota de Consulta
```tsx
// src/App.tsx linha 118
<Route path="/consulta/:patientId" element={<AccountStatusGuard><Consultation /></AccountStatusGuard>} />
```

**✅ Rota existe:** `/consulta/:patientId`
**✅ Componente:** `Consultation.tsx` usa `useParams<{ patientId: string }>()`

---

## 🔍 PROBLEMAS ANTERIORES RELATADOS

### 1. ❓ Coluna `name` vs `full_name`
- **Schema atual:** Usa `full_name` ✅
- **Código:** NewPatient.tsx, EditPatient.tsx usam `full_name` ✅
- **SQL pendente:** Scripts para correção não commitados
- **⚠️ AÇÃO NECESSÁRIA:** Verificar estado REAL do banco Supabase

### 2. ✅ Campo `activity_level`
- **Schema:** Campo existe como ENUM ✅
- **Migrations:** Criado em `20251215133759_remix_migration_from_pg_dump.sql` ✅
- **Código:** NewPatient.tsx linha 135, EditPatient.tsx linha 175 usam corretamente ✅

### 3. ✅ Tabela `custom_recipes`
- **Schema:** Tabela existe ✅
- **Migration:** `20251217031254_df992455-3705-48e9-93e0-094534dd0468.sql` ✅
- **Código:** ConsultationMealPlanEditor.tsx linha 162 usa a tabela ✅

### 4. ✅ Rota `/consulta/:patientId`
- **App.tsx:** Rota configurada linha 118 ✅
- **Consultation.tsx:** Usa `useParams` corretamente linha 74 ✅

---

## 🎯 PRÓXIMAS AÇÕES RECOMENDADAS

### 1️⃣ VERIFICAR BANCO REAL
```sql
-- Executar no Supabase SQL Editor
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'patients'
AND column_name IN ('name', 'full_name')
ORDER BY column_name;
```

### 2️⃣ TESTAR APLICAÇÃO
- Iniciar dev server local
- Testar cadastro de paciente
- Testar geração de cardápio
- Verificar rota `/consulta/:patientId`

### 3️⃣ COMMITAR ARQUIVOS
```bash
# Se os SQLs foram executados com sucesso, commitá-los
git add fix-name-to-fullname.sql fix-remove-name-column.sql
git commit -m "docs: add patient table correction scripts"
```

---

## 📝 NOTAS IMPORTANTES

1. **TypeScript types:** Estão corretos e sincronizados com migrations
2. **Código React:** Usa `full_name` e `activity_level` corretamente
3. **Migrations:** Schema completo com todas as tabelas necessárias
4. **Rotas:** Todas configuradas em português conforme requisito

---

## ⚠️ PENDÊNCIAS CRÍTICAS

- [ ] Confirmar estado REAL do banco Supabase (name vs full_name)
- [ ] Testar fluxo completo: Novo Paciente → Gerar Cardápio → Visualizar
- [ ] Verificar se há pacientes com dados inconsistentes
- [ ] Commitar scripts SQL se não foram commitados

