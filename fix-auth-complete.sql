-- Script completo para corrigir autenticação no Supabase NutriFlow

-- PASSO 1: Garantir que a tabela nutritionists existe
CREATE TABLE IF NOT EXISTS public.nutritionists (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  specialty TEXT,
  crn TEXT,
  phone TEXT,
  subscription_plan TEXT DEFAULT 'free',
  subscription_status TEXT DEFAULT 'active',
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PASSO 2: Habilitar Row Level Security (RLS)
ALTER TABLE public.nutritionists ENABLE ROW LEVEL SECURITY;

-- PASSO 3: Criar políticas RLS para nutritionists
DROP POLICY IF EXISTS "Users can view own nutritionist profile" ON public.nutritionists;
CREATE POLICY "Users can view own nutritionist profile"
  ON public.nutritionists FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own nutritionist profile" ON public.nutritionists;
CREATE POLICY "Users can update own nutritionist profile"
  ON public.nutritionists FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own nutritionist profile" ON public.nutritionists;
CREATE POLICY "Users can insert own nutritionist profile"
  ON public.nutritionists FOR INSERT
  WITH CHECK (auth.uid() = id);

-- PASSO 4: Criar trigger para criar perfil automaticamente após signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.nutritionists (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuário')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PASSO 5: Associar trigger ao evento de novo usuário
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- PASSO 6: Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_nutritionists_email ON public.nutritionists(email);
CREATE INDEX IF NOT EXISTS idx_nutritionists_stripe_customer ON public.nutritionists(stripe_customer_id);

-- PASSO 7: Verificar se há usuários auth.users sem perfil em nutritionists
INSERT INTO public.nutritionists (id, email, full_name)
SELECT
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', 'Usuário')
FROM auth.users au
LEFT JOIN public.nutritionists n ON au.id = n.id
WHERE n.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- PASSO 8: Atualizar timestamp automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_nutritionists_updated_at ON public.nutritionists;
CREATE TRIGGER update_nutritionists_updated_at
  BEFORE UPDATE ON public.nutritionists
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- PASSO 9: Verificar resultado final
SELECT 'Setup completo!' as status,
       (SELECT COUNT(*) FROM auth.users) as total_users,
       (SELECT COUNT(*) FROM public.nutritionists) as total_nutritionists;
