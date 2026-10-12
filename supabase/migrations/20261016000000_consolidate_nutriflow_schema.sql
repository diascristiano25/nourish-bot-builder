-- ============================================================================
-- NUTRIFLOW SCHEMA CONSOLIDATION
-- Created: 2026-10-16
-- Purpose: Ensure all 13 tables from architecture plan exist with proper structure
-- ============================================================================

-- ============================================================================
-- TIER 1: AUTHENTICATION & PROFILES
-- ============================================================================

-- 1. PROFILES (Nutritionists)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  crn TEXT,
  specialties TEXT[],
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'basic', 'premium', 'enterprise')),
  subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'inactive', 'trial', 'expired')),
  subscription_expires_at TIMESTAMPTZ,
  avatar_url TEXT,
  phone TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription ON public.profiles(subscription_status);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (user_id = auth.uid());

-- 2. PATIENTS
CREATE TABLE IF NOT EXISTS public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nutritionist_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  birth_date DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  goal TEXT CHECK (goal IN ('weight_loss', 'muscle_gain', 'maintenance', 'health_improvement', 'sports_performance')),
  dietary_restrictions TEXT[],
  allergies TEXT[],
  health_conditions TEXT[],
  activity_level TEXT CHECK (activity_level IN ('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'paused')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_patients_nutritionist ON public.patients(nutritionist_id);
CREATE INDEX IF NOT EXISTS idx_patients_user_id ON public.patients(user_id);
CREATE INDEX IF NOT EXISTS idx_patients_status ON public.patients(status);

ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Nutritionists can view own patients" ON public.patients
  FOR SELECT USING (nutritionist_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Patients can view own data" ON public.patients
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Nutritionists can insert patients" ON public.patients
  FOR INSERT WITH CHECK (nutritionist_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Nutritionists can update own patients" ON public.patients
  FOR UPDATE USING (nutritionist_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- ============================================================================
-- TIER 2: NUTRITION DATABASE
-- ============================================================================

-- 3. FOOD_DATABASE (TACO base)
CREATE TABLE IF NOT EXISTS public.food_database (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT,
  calories DECIMAL(8,2) NOT NULL,
  protein DECIMAL(8,2) DEFAULT 0,
  carbs DECIMAL(8,2) DEFAULT 0,
  fats DECIMAL(8,2) DEFAULT 0,
  fiber DECIMAL(8,2) DEFAULT 0,
  sodium DECIMAL(8,2) DEFAULT 0,
  serving_size TEXT DEFAULT '100g',
  serving_size_grams DECIMAL(8,2) DEFAULT 100,
  source TEXT DEFAULT 'TACO',
  is_verified BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_food_database_name ON public.food_database(name);
CREATE INDEX IF NOT EXISTS idx_food_database_category ON public.food_database(category);

ALTER TABLE public.food_database ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view food database" ON public.food_database
  FOR SELECT USING (true);

-- 4. CUSTOM_FOODS (Nutritionist-specific foods)
CREATE TABLE IF NOT EXISTS public.custom_foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nutritionist_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,
  calories DECIMAL(8,2) NOT NULL,
  protein DECIMAL(8,2) DEFAULT 0,
  carbs DECIMAL(8,2) DEFAULT 0,
  fats DECIMAL(8,2) DEFAULT 0,
  fiber DECIMAL(8,2) DEFAULT 0,
  sodium DECIMAL(8,2) DEFAULT 0,
  serving_size TEXT DEFAULT '100g',
  serving_size_grams DECIMAL(8,2) DEFAULT 100,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_custom_foods_nutritionist ON public.custom_foods(nutritionist_id);

ALTER TABLE public.custom_foods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Nutritionists can manage own custom foods" ON public.custom_foods
  FOR ALL USING (nutritionist_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- 5. CUSTOM_RECIPES
CREATE TABLE IF NOT EXISTS public.custom_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nutritionist_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  ingredients JSONB NOT NULL DEFAULT '[]',
  instructions TEXT,
  prep_time_minutes INTEGER,
  servings INTEGER DEFAULT 1,
  calories_per_serving DECIMAL(8,2),
  protein_per_serving DECIMAL(8,2),
  carbs_per_serving DECIMAL(8,2),
  fats_per_serving DECIMAL(8,2),
  tags TEXT[],
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_custom_recipes_nutritionist ON public.custom_recipes(nutritionist_id);

ALTER TABLE public.custom_recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Nutritionists can manage own recipes" ON public.custom_recipes
  FOR ALL USING (nutritionist_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- ============================================================================
-- TIER 3: MEAL PLANS
-- ============================================================================

-- 6. MEAL_PLANS
CREATE TABLE IF NOT EXISTS public.meal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  nutritionist_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  plan_data JSONB NOT NULL DEFAULT '{}',
  start_date DATE NOT NULL,
  end_date DATE,
  target_calories INTEGER,
  target_protein DECIMAL(8,2),
  target_carbs DECIMAL(8,2),
  target_fats DECIMAL(8,2),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived', 'draft')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_meal_plans_patient ON public.meal_plans(patient_id);
CREATE INDEX IF NOT EXISTS idx_meal_plans_nutritionist ON public.meal_plans(nutritionist_id);
CREATE INDEX IF NOT EXISTS idx_meal_plans_status ON public.meal_plans(status);

ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Nutritionists can manage own meal plans" ON public.meal_plans
  FOR ALL USING (nutritionist_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Patients can view own meal plans" ON public.meal_plans
  FOR SELECT USING (patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid()));

-- ============================================================================
-- TIER 4: MONITORING
-- ============================================================================

-- 7. ANTHROPOMETRICS (Body measurements)
CREATE TABLE IF NOT EXISTS public.anthropometrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  weight DECIMAL(5,2),
  height DECIMAL(5,2),
  bmi DECIMAL(5,2),
  body_fat_percentage DECIMAL(5,2),
  waist_circumference DECIMAL(5,2),
  hip_circumference DECIMAL(5,2),
  chest_circumference DECIMAL(5,2),
  arm_circumference DECIMAL(5,2),
  measured_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_anthropometrics_patient ON public.anthropometrics(patient_id);
CREATE INDEX IF NOT EXISTS idx_anthropometrics_measured_at ON public.anthropometrics(measured_at DESC);

ALTER TABLE public.anthropometrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Nutritionists can manage patient anthropometrics" ON public.anthropometrics
  FOR ALL USING (
    patient_id IN (
      SELECT id FROM public.patients
      WHERE nutritionist_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Patients can view own anthropometrics" ON public.anthropometrics
  FOR SELECT USING (
    patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid())
  );

-- 8. WATER_LOGS (Already exists from previous migration - ensure consistency)
-- See: 20261008083701_add_missing_tables.sql

-- 9. FOOD_INTAKE_LOGS
CREATE TABLE IF NOT EXISTS public.food_intake_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack', 'pre_workout', 'post_workout')),
  food_id UUID REFERENCES public.food_database(id) ON DELETE SET NULL,
  custom_food_id UUID REFERENCES public.custom_foods(id) ON DELETE SET NULL,
  food_name TEXT NOT NULL,
  quantity DECIMAL(8,2) NOT NULL,
  unit TEXT DEFAULT 'g',
  calories DECIMAL(8,2),
  protein DECIMAL(8,2),
  carbs DECIMAL(8,2),
  fats DECIMAL(8,2),
  logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_food_intake_patient ON public.food_intake_logs(patient_id);
CREATE INDEX IF NOT EXISTS idx_food_intake_logged_at ON public.food_intake_logs(logged_at DESC);

ALTER TABLE public.food_intake_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can manage own food logs" ON public.food_intake_logs
  FOR ALL USING (patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid()));

CREATE POLICY "Nutritionists can view patient food logs" ON public.food_intake_logs
  FOR SELECT USING (
    patient_id IN (
      SELECT id FROM public.patients
      WHERE nutritionist_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    )
  );

-- ============================================================================
-- TIER 5: COMMUNICATION
-- ============================================================================

-- 10. APPOINTMENTS
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nutritionist_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  title TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  location TEXT,
  type TEXT CHECK (type IN ('initial', 'follow_up', 'online', 'in_person', 'emergency')),
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')),
  notes TEXT,
  reminder_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_appointments_nutritionist ON public.appointments(nutritionist_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON public.appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_scheduled_at ON public.appointments(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Nutritionists can manage own appointments" ON public.appointments
  FOR ALL USING (nutritionist_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Patients can view own appointments" ON public.appointments
  FOR SELECT USING (patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid()));

-- 11. MESSAGES (Chat nutritionist-patient)
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  attachments JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON public.messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_patient ON public.messages(patient_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own messages" ON public.messages
  FOR SELECT USING (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "Users can send messages" ON public.messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Recipients can update message status" ON public.messages
  FOR UPDATE USING (recipient_id = auth.uid());

-- 12. SUPPORT_TICKETS (Already exists from previous migration)
-- See: 20261008083701_add_missing_tables.sql

-- ============================================================================
-- TIER 6: FINANCIAL
-- ============================================================================

-- 13. FINANCIAL_RECORDS (Already exists from previous migration)
-- See: 20261008083701_add_missing_tables.sql

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  -- Only create triggers if they don't exist
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_profiles') THEN
    CREATE TRIGGER set_updated_at_profiles
      BEFORE UPDATE ON public.profiles
      FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_patients') THEN
    CREATE TRIGGER set_updated_at_patients
      BEFORE UPDATE ON public.patients
      FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_custom_foods') THEN
    CREATE TRIGGER set_updated_at_custom_foods
      BEFORE UPDATE ON public.custom_foods
      FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_custom_recipes') THEN
    CREATE TRIGGER set_updated_at_custom_recipes
      BEFORE UPDATE ON public.custom_recipes
      FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_meal_plans') THEN
    CREATE TRIGGER set_updated_at_meal_plans
      BEFORE UPDATE ON public.meal_plans
      FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_anthropometrics') THEN
    CREATE TRIGGER set_updated_at_anthropometrics
      BEFORE UPDATE ON public.anthropometrics
      FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_appointments') THEN
    CREATE TRIGGER set_updated_at_appointments
      BEFORE UPDATE ON public.appointments
      FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;
END
$$;

-- ============================================================================
-- SEED DATA: TACO Food Database Sample
-- ============================================================================

INSERT INTO public.food_database (name, category, calories, protein, carbs, fats, fiber, sodium, source)
VALUES
  ('Arroz branco cozido', 'Cereais', 130, 2.7, 28.2, 0.2, 0.2, 1, 'TACO'),
  ('Feijão preto cozido', 'Leguminosas', 77, 4.5, 14, 0.5, 8.4, 2, 'TACO'),
  ('Frango grelhado', 'Carnes', 165, 31, 0, 3.6, 0, 82, 'TACO'),
  ('Batata doce cozida', 'Tubérculos', 77, 0.6, 18.4, 0.1, 2.2, 9, 'TACO'),
  ('Banana', 'Frutas', 89, 1.1, 22.8, 0.3, 2.6, 1, 'TACO'),
  ('Ovo cozido', 'Ovos', 155, 13, 1.1, 11, 0, 124, 'TACO'),
  ('Peito de frango', 'Carnes', 164, 31.1, 0, 3.2, 0, 63, 'TACO'),
  ('Brócolis cozido', 'Vegetais', 35, 2.4, 7, 0.4, 3.3, 41, 'TACO'),
  ('Maçã', 'Frutas', 52, 0.3, 13.8, 0.2, 2.4, 1, 'TACO'),
  ('Aveia', 'Cereais', 389, 16.9, 66.3, 6.9, 9.1, 2, 'TACO')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- NOTIFY POSTGREST TO RELOAD SCHEMA
-- ============================================================================

NOTIFY pgrst, 'reload schema';

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ NutriFlow Schema Consolidation Complete!';
  RAISE NOTICE '📊 Tables created/verified: 13';
  RAISE NOTICE '🔐 RLS policies applied';
  RAISE NOTICE '⚡ Triggers configured';
  RAISE NOTICE '🌱 Sample TACO data seeded';
END
$$;
