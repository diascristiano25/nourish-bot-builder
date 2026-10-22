-- Migration: Add get_user_role RPC function
-- Returns 'patient' if user has a patient record, otherwise null (nutritionist/admin)

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_id uuid;
  has_patient boolean;
BEGIN
  user_id := auth.uid();

  IF user_id IS NULL THEN
    RETURN NULL;
  END IF;

  -- Check if user exists in patients table
  SELECT EXISTS(SELECT 1 FROM patients WHERE email = (SELECT email FROM auth.users WHERE id = user_id))
  INTO has_patient;

  IF has_patient THEN
    RETURN 'patient';
  END IF;

  -- Default: nutritionist or admin (admin is checked separately via AdminGuard RPC)
  RETURN NULL;
END;
$$;

COMMENT ON FUNCTION public.get_user_role() IS
'Returns patient role for users who exist in patients table, null otherwise (nutritionists/admins)';