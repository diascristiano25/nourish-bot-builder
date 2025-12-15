-- Add admin and account status columns to nutritionists
ALTER TABLE public.nutritionists 
ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS account_status text NOT NULL DEFAULT 'active' CHECK (account_status IN ('active', 'suspended'));

-- Create a security definer function to check admin status (prevents privilege escalation)
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.nutritionists
    WHERE user_id = auth.uid()
      AND is_admin = true
  )
$$;

-- Create a security definer function to get account status
CREATE OR REPLACE FUNCTION public.get_user_account_status()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT account_status FROM public.nutritionists WHERE user_id = auth.uid()),
    'active'
  )
$$;

-- RLS policy for admins to view all nutritionists
CREATE POLICY "Admins can view all nutritionists"
ON public.nutritionists
FOR SELECT
USING (public.is_current_user_admin() = true);

-- RLS policy for admins to update any nutritionist
CREATE POLICY "Admins can update any nutritionist"
ON public.nutritionists
FOR UPDATE
USING (public.is_current_user_admin() = true);