-- Ativação + atribuição de origem
-- 1) guarda a origem do cadastro (UTM) em profiles
-- 2) corrige handle_new_user, que descartava telefone e CRN enviados no cadastro
-- 3) recupera telefone/CRN já enviados por usuários existentes (ficaram só em auth.users)

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS signup_source text,
  ADD COLUMN IF NOT EXISTS utm_source text,
  ADD COLUMN IF NOT EXISTS utm_medium text,
  ADD COLUMN IF NOT EXISTS utm_campaign text,
  ADD COLUMN IF NOT EXISTS utm_content text,
  ADD COLUMN IF NOT EXISTS utm_term text,
  ADD COLUMN IF NOT EXISTS landing_referrer text;

CREATE INDEX IF NOT EXISTS idx_profiles_signup_source ON public.profiles(signup_source);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  meta jsonb := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
BEGIN
  IF COALESCE(meta->>'is_patient', 'false') = 'true' THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.profiles (
    id, user_id, full_name, is_active, is_admin, account_status,
    phone, crn, signup_source, utm_source, utm_medium, utm_campaign,
    utm_content, utm_term, landing_referrer
  ) VALUES (
    gen_random_uuid(),
    NEW.id,
    COALESCE(NULLIF(meta->>'full_name', ''), split_part(NEW.email, '@', 1)),
    true, false, 'trial',
    NULLIF(btrim(meta->>'phone'), ''),
    NULLIF(btrim(meta->>'crn'), ''),
    NULLIF(btrim(meta->>'signup_source'), ''),
    NULLIF(btrim(meta->>'utm_source'), ''),
    NULLIF(btrim(meta->>'utm_medium'), ''),
    NULLIF(btrim(meta->>'utm_campaign'), ''),
    NULLIF(btrim(meta->>'utm_content'), ''),
    NULLIF(btrim(meta->>'utm_term'), ''),
    NULLIF(left(btrim(meta->>'landing_referrer'), 500), '')
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$function$;

-- Recupera telefone/CRN que o trigger antigo descartou (só preenche o que está vazio)
UPDATE public.profiles p
SET phone = COALESCE(NULLIF(btrim(p.phone), ''), NULLIF(btrim(u.raw_user_meta_data->>'phone'), '')),
    crn   = COALESCE(NULLIF(btrim(p.crn), ''),   NULLIF(btrim(u.raw_user_meta_data->>'crn'), ''))
FROM auth.users u
WHERE u.id = p.user_id
  AND (
    (NULLIF(btrim(p.phone), '') IS NULL AND NULLIF(btrim(u.raw_user_meta_data->>'phone'), '') IS NOT NULL)
    OR (NULLIF(btrim(p.crn), '') IS NULL AND NULLIF(btrim(u.raw_user_meta_data->>'crn'), '') IS NOT NULL)
  );
