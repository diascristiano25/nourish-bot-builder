-- Add is_active column to nutritionists table for license control
ALTER TABLE public.nutritionists 
ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_nutritionists_is_active ON public.nutritionists(is_active);

-- Update the get_user_account_status function to also check is_active
CREATE OR REPLACE FUNCTION public.get_user_account_status()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    CASE 
      WHEN n.is_active = false THEN 'inactive'
      WHEN n.account_status = 'suspended' THEN 'suspended'
      ELSE 'active'
    END
  FROM public.nutritionists n 
  WHERE n.user_id = auth.uid()
$$;