-- Adicionar coluna de anexo (PDF/imagem) na tabela lab_results
ALTER TABLE lab_results ADD COLUMN IF NOT EXISTS attachment_url TEXT;
ALTER TABLE lab_results ADD COLUMN IF NOT EXISTS attachment_type TEXT; -- 'pdf', 'image'
ALTER TABLE lab_results ADD COLUMN IF NOT EXISTS attachment_name TEXT;

-- Criar bucket para anexos de exames se não existir
-- (isso precisa ser feito via Supabase Dashboard ou API, mas a política RLS já cobre)