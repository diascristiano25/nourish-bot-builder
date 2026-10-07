-- ========================================
-- NUTRIFLOW COMPLETE DATABASE FIX
-- ========================================
-- This script creates all missing tables and fixes schema issues

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ========================================
-- FUNCTION: update_updated_at_column
-- ========================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- TABLE: custom_recipes
-- ========================================
CREATE TABLE IF NOT EXISTS public.custom_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nutritionist_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  ingredients JSONB DEFAULT '[]'::jsonb,
  instructions TEXT,
  servings INTEGER,
  prep_time INTEGER,
  cook_time INTEGER,
  category TEXT,
  calories NUMERIC,
  protein NUMERIC,
  carbs NUMERIC,
  fat NUMERIC,
  fiber NUMERIC,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_custom_recipes_nutritionist_id ON public.custom_recipes(nutritionist_id);
CREATE INDEX IF NOT EXISTS idx_custom_recipes_category ON public.custom_recipes(category);
CREATE INDEX IF NOT EXISTS idx_custom_recipes_is_active ON public.custom_recipes(is_active);

ALTER TABLE public.custom_recipes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Nutritionists can view own recipes" ON public.custom_recipes;
CREATE POLICY "Nutritionists can view own recipes"
  ON public.custom_recipes FOR SELECT
  USING (nutritionist_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Nutritionists can insert own recipes" ON public.custom_recipes;
CREATE POLICY "Nutritionists can insert own recipes"
  ON public.custom_recipes FOR INSERT
  WITH CHECK (nutritionist_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Nutritionists can update own recipes" ON public.custom_recipes;
CREATE POLICY "Nutritionists can update own recipes"
  ON public.custom_recipes FOR UPDATE
  USING (nutritionist_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Nutritionists can delete own recipes" ON public.custom_recipes;
CREATE POLICY "Nutritionists can delete own recipes"
  ON public.custom_recipes FOR DELETE
  USING (nutritionist_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

DROP TRIGGER IF EXISTS update_custom_recipes_updated_at ON public.custom_recipes;
CREATE TRIGGER update_custom_recipes_updated_at
  BEFORE UPDATE ON public.custom_recipes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- TABLE: anthropometrics
-- ========================================
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

DROP POLICY IF EXISTS "Nutritionists can view patient anthropometrics" ON public.anthropometrics;
CREATE POLICY "Nutritionists can view patient anthropometrics"
  ON public.anthropometrics FOR SELECT
  USING (
    patient_id IN (
      SELECT id FROM public.patients
      WHERE nutritionist_id IN (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Nutritionists can insert patient anthropometrics" ON public.anthropometrics;
CREATE POLICY "Nutritionists can insert patient anthropometrics"
  ON public.anthropometrics FOR INSERT
  WITH CHECK (
    patient_id IN (
      SELECT id FROM public.patients
      WHERE nutritionist_id IN (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Nutritionists can update patient anthropometrics" ON public.anthropometrics;
CREATE POLICY "Nutritionists can update patient anthropometrics"
  ON public.anthropometrics FOR UPDATE
  USING (
    patient_id IN (
      SELECT id FROM public.patients
      WHERE nutritionist_id IN (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Nutritionists can delete patient anthropometrics" ON public.anthropometrics;
CREATE POLICY "Nutritionists can delete patient anthropometrics"
  ON public.anthropometrics FOR DELETE
  USING (
    patient_id IN (
      SELECT id FROM public.patients
      WHERE nutritionist_id IN (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()
      )
    )
  );

-- ========================================
-- TABLE: weight_logs
-- ========================================
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

DROP POLICY IF EXISTS "Nutritionists can view patient weight logs" ON public.weight_logs;
CREATE POLICY "Nutritionists can view patient weight logs"
  ON public.weight_logs FOR SELECT
  USING (
    patient_id IN (
      SELECT id FROM public.patients
      WHERE nutritionist_id IN (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Patients can view own weight logs" ON public.weight_logs;
CREATE POLICY "Patients can view own weight logs"
  ON public.weight_logs FOR SELECT
  USING (
    patient_id IN (
      SELECT id FROM public.patients WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Nutritionists can insert patient weight logs" ON public.weight_logs;
CREATE POLICY "Nutritionists can insert patient weight logs"
  ON public.weight_logs FOR INSERT
  WITH CHECK (
    patient_id IN (
      SELECT id FROM public.patients
      WHERE nutritionist_id IN (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Patients can insert own weight logs" ON public.weight_logs;
CREATE POLICY "Patients can insert own weight logs"
  ON public.weight_logs FOR INSERT
  WITH CHECK (
    patient_id IN (
      SELECT id FROM public.patients WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Nutritionists can update patient weight logs" ON public.weight_logs;
CREATE POLICY "Nutritionists can update patient weight logs"
  ON public.weight_logs FOR UPDATE
  USING (
    patient_id IN (
      SELECT id FROM public.patients
      WHERE nutritionist_id IN (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Patients can update own weight logs" ON public.weight_logs;
CREATE POLICY "Patients can update own weight logs"
  ON public.weight_logs FOR UPDATE
  USING (
    patient_id IN (
      SELECT id FROM public.patients WHERE user_id = auth.uid()
    )
  );

-- ========================================
-- TABLE: water_logs
-- ========================================
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

DROP POLICY IF EXISTS "Nutritionists can view patient water logs" ON public.water_logs;
CREATE POLICY "Nutritionists can view patient water logs"
  ON public.water_logs FOR SELECT
  USING (
    patient_id IN (
      SELECT id FROM public.patients
      WHERE nutritionist_id IN (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Patients can view own water logs" ON public.water_logs;
CREATE POLICY "Patients can view own water logs"
  ON public.water_logs FOR SELECT
  USING (
    patient_id IN (
      SELECT id FROM public.patients WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Nutritionists can insert patient water logs" ON public.water_logs;
CREATE POLICY "Nutritionists can insert patient water logs"
  ON public.water_logs FOR INSERT
  WITH CHECK (
    patient_id IN (
      SELECT id FROM public.patients
      WHERE nutritionist_id IN (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Patients can insert own water logs" ON public.water_logs;
CREATE POLICY "Patients can insert own water logs"
  ON public.water_logs FOR INSERT
  WITH CHECK (
    patient_id IN (
      SELECT id FROM public.patients WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Nutritionists can update patient water logs" ON public.water_logs;
CREATE POLICY "Nutritionists can update patient water logs"
  ON public.water_logs FOR UPDATE
  USING (
    patient_id IN (
      SELECT id FROM public.patients
      WHERE nutritionist_id IN (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Patients can update own water logs" ON public.water_logs;
CREATE POLICY "Patients can update own water logs"
  ON public.water_logs FOR UPDATE
  USING (
    patient_id IN (
      SELECT id FROM public.patients WHERE user_id = auth.uid()
    )
  );

-- ========================================
-- TABLE: financial_records
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

CREATE INDEX IF NOT EXISTS idx_financial_records_nutritionist_id ON public.financial_records(nutritionist_id);
CREATE INDEX IF NOT EXISTS idx_financial_records_patient_id ON public.financial_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_financial_records_date ON public.financial_records(date DESC);
CREATE INDEX IF NOT EXISTS idx_financial_records_type ON public.financial_records(type);

ALTER TABLE public.financial_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Nutritionists can view own financial records" ON public.financial_records;
CREATE POLICY "Nutritionists can view own financial records"
  ON public.financial_records FOR SELECT
  USING (nutritionist_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Nutritionists can insert own financial records" ON public.financial_records;
CREATE POLICY "Nutritionists can insert own financial records"
  ON public.financial_records FOR INSERT
  WITH CHECK (nutritionist_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Nutritionists can update own financial records" ON public.financial_records;
CREATE POLICY "Nutritionists can update own financial records"
  ON public.financial_records FOR UPDATE
  USING (nutritionist_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Nutritionists can delete own financial records" ON public.financial_records;
CREATE POLICY "Nutritionists can delete own financial records"
  ON public.financial_records FOR DELETE
  USING (nutritionist_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

DROP TRIGGER IF EXISTS update_financial_records_updated_at ON public.financial_records;
CREATE TRIGGER update_financial_records_updated_at
  BEFORE UPDATE ON public.financial_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- TABLE: support_tickets
-- ========================================
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  category TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON public.support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON public.support_tickets(created_at DESC);

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own tickets" ON public.support_tickets;
CREATE POLICY "Users can view own tickets"
  ON public.support_tickets FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own tickets" ON public.support_tickets;
CREATE POLICY "Users can create own tickets"
  ON public.support_tickets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own tickets" ON public.support_tickets;
CREATE POLICY "Users can update own tickets"
  ON public.support_tickets FOR UPDATE
  USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_support_tickets_updated_at ON public.support_tickets;
CREATE TRIGGER update_support_tickets_updated_at
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- TABLE: support_ticket_messages
-- ========================================
CREATE TABLE IF NOT EXISTS public.support_ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'admin', 'system')),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_ticket_messages_ticket_id ON public.support_ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_support_ticket_messages_created_at ON public.support_ticket_messages(created_at);

ALTER TABLE public.support_ticket_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view messages for own tickets" ON public.support_ticket_messages;
CREATE POLICY "Users can view messages for own tickets"
  ON public.support_ticket_messages FOR SELECT
  USING (
    ticket_id IN (
      SELECT id FROM public.support_tickets WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can send messages to own tickets" ON public.support_ticket_messages;
CREATE POLICY "Users can send messages to own tickets"
  ON public.support_ticket_messages FOR INSERT
  WITH CHECK (
    ticket_id IN (
      SELECT id FROM public.support_tickets WHERE user_id = auth.uid()
    )
  );

-- ========================================
-- TABLE: consultations
-- ========================================
CREATE TABLE IF NOT EXISTS public.consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  nutritionist_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  diagnosis TEXT,
  recommendations TEXT,
  follow_up_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_consultations_patient_id ON public.consultations(patient_id);
CREATE INDEX IF NOT EXISTS idx_consultations_nutritionist_id ON public.consultations(nutritionist_id);
CREATE INDEX IF NOT EXISTS idx_consultations_date ON public.consultations(date DESC);

ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Nutritionists can view own consultations" ON public.consultations;
CREATE POLICY "Nutritionists can view own consultations"
  ON public.consultations FOR SELECT
  USING (nutritionist_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Nutritionists can insert own consultations" ON public.consultations;
CREATE POLICY "Nutritionists can insert own consultations"
  ON public.consultations FOR INSERT
  WITH CHECK (nutritionist_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Nutritionists can update own consultations" ON public.consultations;
CREATE POLICY "Nutritionists can update own consultations"
  ON public.consultations FOR UPDATE
  USING (nutritionist_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Nutritionists can delete own consultations" ON public.consultations;
CREATE POLICY "Nutritionists can delete own consultations"
  ON public.consultations FOR DELETE
  USING (nutritionist_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

DROP TRIGGER IF EXISTS update_consultations_updated_at ON public.consultations;
CREATE TRIGGER update_consultations_updated_at
  BEFORE UPDATE ON public.consultations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- ENABLE REALTIME FOR KEY TABLES
-- ========================================
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS public.weight_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS public.water_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS public.support_ticket_messages;

-- ========================================
-- VERIFICATION QUERY
-- ========================================
SELECT
  schemaname,
  tablename,
  tableowner
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'profiles', 'patients', 'appointments', 'custom_foods', 'custom_recipes',
    'messages', 'meal_plans', 'anthropometrics', 'weight_logs', 'water_logs',
    'financial_records', 'support_tickets', 'support_ticket_messages', 'consultations'
  )
ORDER BY tablename;
