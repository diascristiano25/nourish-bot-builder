-- ============================================================================
-- BILLING ACCESS RULES
-- Created: 2026-11-09
--
-- Who may use the app:
--   1. admin                       -> 'admin'
--   2. account_status = 'active'   -> 'licensed'  (license granted manually by an admin)
--   3. active Stripe subscription  -> 'subscription'
--   4. trial not yet expired       -> 'trial'
--   5. everything else             -> 'expired'
--
-- Patients inherit the access of their nutritionist.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_billing_access(p_user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_admin BOOLEAN;
  v_account_status TEXT;
  v_trial_ends_at TIMESTAMPTZ;
BEGIN
  SELECT p.is_admin, p.account_status, p.trial_ends_at
    INTO v_is_admin, v_account_status, v_trial_ends_at
    FROM public.profiles p
   WHERE p.user_id = p_user_id;

  IF COALESCE(v_is_admin, FALSE) THEN
    RETURN 'admin';
  END IF;

  IF v_account_status = 'active' THEN
    RETURN 'licensed';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.subscriptions s
    WHERE s.user_id = p_user_id
      AND s.status IN ('active', 'trialing', 'past_due')
      AND (s.current_period_end IS NULL OR s.current_period_end > NOW())
  ) THEN
    RETURN 'subscription';
  END IF;

  IF v_trial_ends_at IS NOT NULL AND v_trial_ends_at > NOW() THEN
    RETURN 'trial';
  END IF;

  RETURN 'expired';
END;
$$;

REVOKE ALL ON FUNCTION public.get_billing_access(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_billing_access(UUID) TO authenticated;

-- Access of the logged-in user, plus the role the app should treat them as.
-- Returns {"access": "...", "role": "nutritionist" | "patient" | "none"}.
CREATE OR REPLACE FUNCTION public.get_my_billing_access()
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_nutri_user_id UUID;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('access', 'none', 'role', 'none');
  END IF;

  IF EXISTS (SELECT 1 FROM public.profiles WHERE user_id = v_uid) THEN
    RETURN jsonb_build_object('access', public.get_billing_access(v_uid), 'role', 'nutritionist');
  END IF;

  SELECT pr.user_id INTO v_nutri_user_id
    FROM public.patients pt
    JOIN public.profiles pr ON pr.id = pt.nutritionist_id
   WHERE pt.user_id = v_uid
   LIMIT 1;

  IF v_nutri_user_id IS NOT NULL THEN
    RETURN jsonb_build_object('access', public.get_billing_access(v_nutri_user_id), 'role', 'patient');
  END IF;

  -- Neither nutritionist nor linked patient: do not block (avoids locking out edge cases)
  RETURN jsonb_build_object('access', 'none', 'role', 'none');
END;
$$;

REVOKE ALL ON FUNCTION public.get_my_billing_access() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_my_billing_access() TO authenticated;

-- Access of the nutritionist that owns a given patient (used by the patient portal function).
CREATE OR REPLACE FUNCTION public.get_patient_billing_access(p_patient_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_nutri_user_id UUID;
BEGIN
  SELECT pr.user_id INTO v_nutri_user_id
    FROM public.patients pt
    JOIN public.profiles pr ON pr.id = pt.nutritionist_id
   WHERE pt.id = p_patient_id;

  IF v_nutri_user_id IS NULL THEN
    RETURN 'none';
  END IF;

  RETURN public.get_billing_access(v_nutri_user_id);
END;
$$;

REVOKE ALL ON FUNCTION public.get_patient_billing_access(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_patient_billing_access(UUID) TO authenticated;
