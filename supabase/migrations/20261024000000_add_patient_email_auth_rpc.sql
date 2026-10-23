-- Migration: Add patient email verification RPC for first-access signup
-- Allows unauthenticated users to verify their email exists in the patients table

CREATE OR REPLACE FUNCTION public.patients_select_by_email_for_auth(patient_email TEXT)
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  nutritionist_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Return patient data if email matches, regardless of auth state
  RETURN QUERY
  SELECT p.id, p.full_name, p.nutritionist_id
  FROM patients p
  WHERE p.email = patient_email;
END;
$$;

COMMENT ON FUNCTION public.patients_select_by_email_for_auth(TEXT) IS
'Bypasses RLS to allow email verification during patient signup (first access flow)';
