-- Add critical_tags column to patients for alert badges
ALTER TABLE public.patients 
ADD COLUMN IF NOT EXISTS critical_tags text[] DEFAULT '{}';

-- Add comment
COMMENT ON COLUMN public.patients.critical_tags IS 'Tags críticas do paciente (Vegano, Diabético, etc.)';

-- Create food_database table with comprehensive food data
CREATE TABLE IF NOT EXISTS public.food_database (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  category text NOT NULL,
  brand text,
  portion_description text NOT NULL DEFAULT '100g',
  portion_grams numeric NOT NULL DEFAULT 100,
  calories numeric NOT NULL DEFAULT 0,
  protein numeric NOT NULL DEFAULT 0,
  carbs numeric NOT NULL DEFAULT 0,
  fat numeric NOT NULL DEFAULT 0,
  fiber numeric DEFAULT 0,
  sodium numeric DEFAULT 0,
  is_supplement boolean NOT NULL DEFAULT false,
  supplement_type text,
  source text DEFAULT 'TACO',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.food_database ENABLE ROW LEVEL SECURITY;

-- Food database is read-only for all authenticated users (shared data)
CREATE POLICY "Authenticated users can read food database" 
ON public.food_database 
FOR SELECT 
TO authenticated
USING (true);

-- Only admins can modify food database
CREATE POLICY "Admins can manage food database" 
ON public.food_database 
FOR ALL 
USING (is_current_user_admin() = true);

-- Create index for fast searching
CREATE INDEX IF NOT EXISTS idx_food_database_name ON public.food_database USING gin(to_tsvector('portuguese', name));
CREATE INDEX IF NOT EXISTS idx_food_database_category ON public.food_database (category);
CREATE INDEX IF NOT EXISTS idx_food_database_brand ON public.food_database (brand) WHERE brand IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_food_database_is_supplement ON public.food_database (is_supplement);