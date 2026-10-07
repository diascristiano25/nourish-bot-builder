-- NutriFlow Database Schema
-- Execute este SQL no Supabase SQL Editor

-- 1. Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabela de perfis (ligada ao auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  subscription_plan TEXT DEFAULT 'free',
  subscription_status TEXT DEFAULT 'active',
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela de clientes (pacientes do nutricionista)
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nutritionist_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  birthdate DATE,
  gender TEXT,
  weight DECIMAL(5,2),
  height DECIMAL(5,2),
  activity_level TEXT,
  dietary_restrictions TEXT[],
  health_conditions TEXT[],
  goals TEXT[],
  notes TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabela de cardápios gerados
CREATE TABLE IF NOT EXISTS meal_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  nutritionist_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  calories_target INTEGER,
  protein_target INTEGER,
  carbs_target INTEGER,
  fat_target INTEGER,
  meals JSONB NOT NULL DEFAULT '[]',
  status TEXT DEFAULT 'active',
  ai_generated BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tabela de campanhas de marketing
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nutritionist_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target_audience TEXT,
  platform TEXT DEFAULT 'meta',
  budget DECIMAL(10,2),
  status TEXT DEFAULT 'draft',
  meta_campaign_id TEXT,
  meta_ad_set_id TEXT,
  meta_ad_id TEXT,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  spend DECIMAL(10,2) DEFAULT 0,
  creative_url TEXT,
  schedule_start TIMESTAMP WITH TIME ZONE,
  schedule_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. RLS (Row Level Security) - Habilitar
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- 7. Políticas de Segurança - profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 8. Políticas de Segurança - clients
CREATE POLICY "Nutritionists can view own clients" ON clients
  FOR SELECT USING (auth.uid() = nutritionist_id);

CREATE POLICY "Nutritionists can insert own clients" ON clients
  FOR INSERT WITH CHECK (auth.uid() = nutritionist_id);

CREATE POLICY "Nutritionists can update own clients" ON clients
  FOR UPDATE USING (auth.uid() = nutritionist_id);

CREATE POLICY "Nutritionists can delete own clients" ON clients
  FOR DELETE USING (auth.uid() = nutritionist_id);

-- 9. Políticas de Segurança - meal_plans
CREATE POLICY "Nutritionists can view own meal plans" ON meal_plans
  FOR SELECT USING (auth.uid() = nutritionist_id);

CREATE POLICY "Nutritionists can insert own meal plans" ON meal_plans
  FOR INSERT WITH CHECK (auth.uid() = nutritionist_id);

CREATE POLICY "Nutritionists can update own meal plans" ON meal_plans
  FOR UPDATE USING (auth.uid() = nutritionist_id);

CREATE POLICY "Nutritionists can delete own meal plans" ON meal_plans
  FOR DELETE USING (auth.uid() = nutritionist_id);

-- 10. Políticas de Segurança - campaigns
CREATE POLICY "Nutritionists can view own campaigns" ON campaigns
  FOR SELECT USING (auth.uid() = nutritionist_id);

CREATE POLICY "Nutritionists can insert own campaigns" ON campaigns
  FOR INSERT WITH CHECK (auth.uid() = nutritionist_id);

CREATE POLICY "Nutritionists can update own campaigns" ON campaigns
  FOR UPDATE USING (auth.uid() = nutritionist_id);

CREATE POLICY "Nutritionists can delete own campaigns" ON campaigns
  FOR DELETE USING (auth.uid() = nutritionist_id);

-- 11. Função para criar perfil automaticamente ao registrar
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Trigger para criar perfil ao registrar
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 13. Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 14. Triggers para updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_meal_plans_updated_at
  BEFORE UPDATE ON meal_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
