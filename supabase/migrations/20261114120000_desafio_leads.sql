-- Leads do /desafio-nutri: gravados no clique de "Criar minha conta grátis",
-- antes de a conta existir. Quem desiste no meio do cadastro continua na lista.
CREATE TABLE IF NOT EXISTS public.desafio_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  whatsapp text NOT NULL,
  lost_hours integer,
  utm jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'novo',           -- novo | conta_criada
  whatsapp_sent_at timestamptz,
  whatsapp_error text,
  account_created_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS desafio_leads_email_key ON public.desafio_leads (lower(email));

ALTER TABLE public.desafio_leads ENABLE ROW LEVEL SECURITY;

-- Escrita só pela edge function (service role). Leitura só para o admin master.
DROP POLICY IF EXISTS "Admins read desafio leads" ON public.desafio_leads;
CREATE POLICY "Admins read desafio leads" ON public.desafio_leads
  FOR SELECT TO authenticated
  USING (public.is_current_user_master_admin());

-- Quando a conta é criada, o lead muda para "conta_criada".
-- Nunca pode bloquear o cadastro: qualquer erro é ignorado.
CREATE OR REPLACE FUNCTION public.mark_desafio_lead_converted()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  BEGIN
    UPDATE public.desafio_leads
       SET status = 'conta_criada', account_created_at = now(), updated_at = now()
     WHERE lower(email) = lower(NEW.email) AND status <> 'conta_criada';
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_mark_desafio_lead ON auth.users;
CREATE TRIGGER on_auth_user_created_mark_desafio_lead
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.mark_desafio_lead_converted();
