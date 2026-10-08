-- ========================================
-- NUTRIFLOW - COMPLETE DATABASE FIX
-- ========================================
-- Fixes all known schema issues:
-- 1. Add missing activity_level column to patients table
-- 2. Create custom_recipes table with proper RLS
-- 3. Create financial_records table with proper RLS
-- 4. Verify all tables and create missing ones
-- ========================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ========================================
-- HELPER FUNCTION: update_updated_at_column
-- ========================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- FIX 1: Add activity_level column to patients table
-- ========================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'patients'
      AND column_name = 'activity_level'
  ) THEN
    ALTER TABLE public.patients
    ADD COLUMN activity_level TEXT DEFAULT 'moderado';

    RAISE NOTICE 'Column activity_level added to patients table';
  ELSE
    RAISE NOTICE 'Column activity_level already exists in patients table';
  END IF;
END $$;

-- ========================================
-- FIX 2: Create custom_recipes table
-- ========================================
CREATE TABLE IF NOT EXISTS public.custom_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nutritionist_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  ingredients JSONB DEFAULT '[]'::jsonb,
  instructions TEXT,
  nutrition_info JSONB DEFAULT '{}'::jsonb,
  category TEXT,
  prep_time_minutes INTEGER,
  servings INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for custom_recipes
CREATE INDEX IF NOT EXISTS idx_custom_recipes_nutritionist_id ON public.custom_recipes(nutritionist_id);
CREATE INDEX IF NOT EXISTS idx_custom_recipes_category ON public.custom_recipes(category);
CREATE INDEX IF NOT EXISTS idx_custom_recipes_is_active ON public.custom_recipes(is_active);

-- Enable RLS
ALTER TABLE public.custom_recipes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for custom_recipes
DROP POLICY IF EXISTS "Nutricionistas podem ver próprias receitas" ON public.custom_recipes;
CREATE POLICY "Nutricionistas podem ver próprias receitas"
  ON public.custom_recipes FOR SELECT
  USING (nutritionist_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Nutricionistas podem inserir receitas" ON public.custom_recipes;
CREATE POLICY "Nutricionistas podem inserir receitas"
  ON public.custom_recipes FOR INSERT
  WITH CHECK (nutritionist_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Nutricionistas podem atualizar receitas" ON public.custom_recipes;
CREATE POLICY "Nutricionistas podem atualizar receitas"
  ON public.custom_recipes FOR UPDATE
  USING (nutritionist_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Nutricionistas podem deletar receitas" ON public.custom_recipes;
CREATE POLICY "Nutricionistas podem deletar receitas"
  ON public.custom_recipes FOR DELETE
  USING (nutritionist_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_custom_recipes_updated_at ON public.custom_recipes;
CREATE TRIGGER update_custom_recipes_updated_at
  BEFORE UPDATE ON public.custom_recipes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- FIX 3: Create financial_records table
-- ========================================
CREATE TABLE IF NOT EXISTS public.financial_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nutritionist_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'payment', 'refund')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  date DATE NOT NULL,
  description TEXT,
  payment_method TEXT,
  invoice_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for financial_records
CREATE INDEX IF NOT EXISTS idx_financial_records_nutritionist_id ON public.financial_records(nutritionist_id);
CREATE INDEX IF NOT EXISTS idx_financial_records_patient_id ON public.financial_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_financial_records_date ON public.financial_records(date DESC);
CREATE INDEX IF NOT EXISTS idx_financial_records_type ON public.financial_records(type);
CREATE INDEX IF NOT EXISTS idx_financial_records_status ON public.financial_records(status);

-- Enable RLS
ALTER TABLE public.financial_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies for financial_records
DROP POLICY IF EXISTS "Nutricionistas podem ver próprios registros" ON public.financial_records;
CREATE POLICY "Nutricionistas podem ver próprios registros"
  ON public.financial_records FOR SELECT
  USING (nutritionist_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Nutricionistas podem inserir registros" ON public.financial_records;
CREATE POLICY "Nutricionistas podem inserir registros"
  ON public.financial_records FOR INSERT
  WITH CHECK (nutritionist_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Nutricionistas podem atualizar registros" ON public.financial_records;
CREATE POLICY "Nutricionistas podem atualizar registros"
  ON public.financial_records FOR UPDATE
  USING (nutritionist_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Nutricionistas podem deletar registros" ON public.financial_records;
CREATE POLICY "Nutricionistas podem deletar registros"
  ON public.financial_records FOR DELETE
  USING (nutritionist_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_financial_records_updated_at ON public.financial_records;
CREATE TRIGGER update_financial_records_updated_at
  BEFORE UPDATE ON public.financial_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- CREATE OTHER ESSENTIAL TABLES
-- ========================================

-- Table: anthropometrics
CREATE TABLE IF NOT EXISTS public.anthropometrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  weight NUMERIC,
  height NUMERIC,
  bmi NUMERIC,
  body_fat_percentage NUMERIC,
  muscle_mass NUMERIC,
  waist NUMERIC,
  hip NUMERIC,
  chest NUMERIC,
  arm NUMERIC,
  thigh NUMERIC,
  notes TEXT,
  measured_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_anthropometrics_patient_id ON public.anthropometrics(patient_id);
CREATE INDEX IF NOT EXISTS idx_anthropometrics_measured_at ON public.anthropometrics(measured_at DESC);

ALTER TABLE public.anthropometrics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Nutricionistas podem ver antropometria dos pacientes" ON public.anthropometrics;
CREATE POLICY "Nutricionistas podem ver antropometria dos pacientes"
  ON public.anthropometrics FOR SELECT
  USING (
    patient_id IN (
      SELECT id FROM public.patients
      WHERE nutritionist_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Nutricionistas podem inserir antropometria" ON public.anthropometrics;
CREATE POLICY "Nutricionistas podem inserir antropometria"
  ON public.anthropometrics FOR INSERT
  WITH CHECK (
    patient_id IN (
      SELECT id FROM public.patients
      WHERE nutritionist_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    )
  );

-- Table: weight_logs
CREATE TABLE IF NOT EXISTS public.weight_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  weight NUMERIC NOT NULL,
  date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_weight_logs_patient_id ON public.weight_logs(patient_id);
CREATE INDEX IF NOT EXISTS idx_weight_logs_date ON public.weight_logs(date DESC);

ALTER TABLE public.weight_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Nutricionistas podem ver peso dos pacientes" ON public.weight_logs;
CREATE POLICY "Nutricionistas podem ver peso dos pacientes"
  ON public.weight_logs FOR SELECT
  USING (
    patient_id IN (
      SELECT id FROM public.patients
      WHERE nutritionist_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Nutricionistas podem inserir peso" ON public.weight_logs;
CREATE POLICY "Nutricionistas podem inserir peso"
  ON public.weight_logs FOR INSERT
  WITH CHECK (
    patient_id IN (
      SELECT id FROM public.patients
      WHERE nutritionist_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    )
  );

-- Table: water_logs
CREATE TABLE IF NOT EXISTS public.water_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  amount_ml INTEGER,
  glasses INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_water_logs_patient_id ON public.water_logs(patient_id);
CREATE INDEX IF NOT EXISTS idx_water_logs_date ON public.water_logs(date DESC);

ALTER TABLE public.water_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Nutricionistas podem ver água dos pacientes" ON public.water_logs;
CREATE POLICY "Nutricionistas podem ver água dos pacientes"
  ON public.water_logs FOR SELECT
  USING (
    patient_id IN (
      SELECT id FROM public.patients
      WHERE nutritionist_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    )
  );

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- List all tables
SELECT 'Tables created:' AS status;
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Verify patients table has activity_level column
SELECT 'Patients table columns:' AS status;
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'patients'
ORDER BY ordinal_position;

-- Verify custom_recipes exists
SELECT 'custom_recipes table:' AS status;
SELECT COUNT(*) as row_count FROM public.custom_recipes;

-- Verify financial_records exists
SELECT 'financial_records table:' AS status;
SELECT COUNT(*) as row_count FROM public.financial_records;

-- List all RLS policies
SELECT 'RLS Policies:' AS status;
SELECT tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('custom_recipes', 'financial_records', 'patients')
ORDER BY tablename, policyname;


