-- Permite que o admin master leia as assinaturas para calcular o status real das contas no painel.
DROP POLICY IF EXISTS "Admins read all subscriptions" ON public.subscriptions;
CREATE POLICY "Admins read all subscriptions" ON public.subscriptions
  FOR SELECT TO authenticated
  USING (public.is_current_user_master_admin());
