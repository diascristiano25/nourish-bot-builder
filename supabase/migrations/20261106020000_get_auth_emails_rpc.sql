-- Email lookup for edge functions that run with the service role.
-- auth.admin.listUsers/getUserById fail on this project ("Database error
-- finding users"), and profiles has no email column, so read auth.users directly.
-- Only service_role may call it.

CREATE OR REPLACE FUNCTION public.get_auth_emails(user_ids uuid[] DEFAULT NULL)
RETURNS TABLE (id uuid, email text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT u.id, u.email::text
  FROM auth.users u
  WHERE u.email IS NOT NULL
    AND (user_ids IS NULL OR u.id = ANY(user_ids));
$$;

REVOKE ALL ON FUNCTION public.get_auth_emails(uuid[]) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_auth_emails(uuid[]) TO service_role;
