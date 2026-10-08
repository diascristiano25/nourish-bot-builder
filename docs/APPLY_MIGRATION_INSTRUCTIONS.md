# ⚠️ INSTRUÇÕES PARA APLICAR MIGRATION MANUALMENTE

## Problema

O Supabase CLI não consegue aplicar migrations remotamente devido a conflitos com migrations antigas já aplicadas. A API do Supabase também não permite executar SQL arbitrário por segurança.

## Solução: Aplicar via Dashboard (3 minutos)

### Passo 1: Acessar SQL Editor

1. Abra: https://supabase.com/dashboard/project/nwenbxqmfpyspxpibgwp/sql/new
2. Faça login se necessário

### Passo 2: Copiar SQL da Migration

Abra o arquivo `supabase/migrations/20261008083701_add_missing_tables.sql` e copie TODO o conteúdo (358 linhas).

### Passo 3: Executar no Dashboard

1. Cole o SQL completo no editor
2. Clique em **"Run"** (ou pressione Ctrl+Enter)
3. Aguarde a execução (deve levar ~5 segundos)

### Passo 4: Verificar Sucesso

Execute esta query no mesmo SQL Editor para confirmar:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'weight_logs',
    'water_logs', 
    'support_tickets',
    'support_ticket_messages',
    'financial_records',
    'payment_events',
    'purchase_events'
  )
ORDER BY table_name;
```

**Resultado esperado:** 7 linhas (as 7 tabelas)

### Passo 5: Depois de Aplicar

Volte aqui e me confirme que executou. Vou então:

1. ✅ Regenerar `src/lib/database.types.ts` com as novas tabelas
2. ✅ Rodar o audit novamente para confirmar que os problemas sumiram
3. ✅ Commitar tudo

---

## Por Que Não Automatizado?

- **Supabase CLI**: Tenta reaplicar migrations antigas → erro de função duplicada
- **Supabase API**: Não permite SQL arbitrário por segurança (proteção contra SQL injection)
- **Dashboard**: Único método seguro e direto

---

## Se Preferir psql (Alternativa)

```bash
# 1. Obter connection string no Dashboard:
#    Settings > Database > Connection string (Direct connection)

# 2. Executar migration:
psql "postgresql://postgres.[PASSWORD]@db.nwenbxqmfpyspxpibgwp.supabase.co:5432/postgres" \
  -f supabase/migrations/20261008083701_add_missing_tables.sql
```

---

**AGUARDANDO VOCÊ APLICAR A MIGRATION...** 🕐

Quando terminar, me avise com: "migration aplicada" ou "executei o SQL"
