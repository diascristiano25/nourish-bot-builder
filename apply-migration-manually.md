# Como Aplicar a Migration Manualmente

## Problema
O comando `npx supabase db push` está tentando reaplicar migrations antigas que já existem no banco, causando erro de função duplicada.

## Solução: Aplicar SQL Diretamente

### Opção 1: Via Supabase Dashboard (Recomendado)

1. Acesse: https://supabase.com/dashboard/project/nwenbxqmfpyspxpibgwp/editor
2. Vá em SQL Editor
3. Cole o conteúdo completo de `supabase/migrations/20261008083701_add_missing_tables.sql`
4. Execute o SQL
5. Verifique que as 7 tabelas foram criadas

### Opção 2: Via psql

```bash
# Obter a connection string do Supabase Dashboard
# Em: Settings > Database > Connection string (URI)

psql "postgresql://postgres:[PASSWORD]@db.nwenbxqmfpyspxpibgwp.supabase.co:5432/postgres" \
  -f supabase/migrations/20261008083701_add_missing_tables.sql
```

### Verificar que Funcionou

Execute esta query no SQL Editor para confirmar:

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

Deve retornar as 7 tabelas.

### Depois de Aplicar

Execute a Tarefa 3 para regenerar types.ts:

```bash
npx supabase gen types typescript --project-id nwenbxqmfpyspxpibgwp > src/lib/database.types.ts
```
