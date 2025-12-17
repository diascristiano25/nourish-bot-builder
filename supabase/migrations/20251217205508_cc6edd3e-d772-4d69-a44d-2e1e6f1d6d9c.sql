-- Add is_master_admin column to nutritionists table
ALTER TABLE public.nutritionists 
ADD COLUMN IF NOT EXISTS is_master_admin BOOLEAN NOT NULL DEFAULT false;

-- Create server-side function to check master admin status
CREATE OR REPLACE FUNCTION public.is_current_user_master_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.nutritionists
    WHERE user_id = auth.uid()
      AND is_master_admin = true
  )
$$;