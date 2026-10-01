
CREATE TABLE public.leads_nutriflow (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome text NOT NULL,
  whatsapp text UNIQUE NOT NULL,
  instagram text,
  status text NOT NULL DEFAULT 'novo',
  contexto_post text,
  ultima_interacao timestamptz DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.leads_nutriflow ENABLE ROW LEVEL SECURITY;

-- Authenticated users (nutritionists) can view all leads
CREATE POLICY "Authenticated users can view leads"
ON public.leads_nutriflow FOR SELECT
TO authenticated
USING (true);

-- Authenticated users can insert leads
CREATE POLICY "Authenticated users can insert leads"
ON public.leads_nutriflow FOR INSERT
TO authenticated
WITH CHECK (true);

-- Authenticated users can update leads
CREATE POLICY "Authenticated users can update leads"
ON public.leads_nutriflow FOR UPDATE
TO authenticated
USING (true);

-- Authenticated users can delete leads
CREATE POLICY "Authenticated users can delete leads"
ON public.leads_nutriflow FOR DELETE
TO authenticated
USING (true);

-- Block anonymous access
CREATE POLICY "Block anon select leads" ON public.leads_nutriflow FOR SELECT TO anon USING (false);
CREATE POLICY "Block anon insert leads" ON public.leads_nutriflow FOR INSERT TO anon WITH CHECK (false);
CREATE POLICY "Block anon update leads" ON public.leads_nutriflow FOR UPDATE TO anon USING (false) WITH CHECK (false);
CREATE POLICY "Block anon delete leads" ON public.leads_nutriflow FOR DELETE TO anon USING (false);
