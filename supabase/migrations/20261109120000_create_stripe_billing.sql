-- ============================================================================
-- STRIPE BILLING
-- Created: 2026-11-09
-- Purpose: store Stripe customers, subscriptions and processed webhook events.
--
-- Trial model: the trial is NOT created in Stripe. It lives in
-- profiles.trial_start_date / trial_ended (no card required). Stripe is only
-- involved when the nutritionist chooses a plan (create-checkout function).
--
-- Writes to these tables happen only through Edge Functions using the
-- service role key, which bypasses RLS. Clients may only read their own rows.
-- ============================================================================

-- 1. Stripe customer per user (one customer per nutritionist)
CREATE TABLE IF NOT EXISTS public.stripe_customers (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Subscription state mirrored from Stripe (source of truth = Stripe,
--    this table is a cache kept up to date by the webhook)
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT NOT NULL,
  plan TEXT NOT NULL CHECK (plan IN ('starter', 'pro', 'enterprise')),
  -- Stripe statuses: incomplete, incomplete_expired, trialing, active,
  -- past_due, canceled, unpaid, paused
  status TEXT NOT NULL,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);

-- 3. Webhook idempotency: Stripe may deliver the same event more than once
CREATE TABLE IF NOT EXISTS public.stripe_events (
  id TEXT PRIMARY KEY,            -- Stripe event id (evt_...)
  type TEXT NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- RLS
-- ============================================================================
ALTER TABLE public.stripe_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own stripe customer" ON public.stripe_customers;
CREATE POLICY "Users read own stripe customer" ON public.stripe_customers
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users read own subscriptions" ON public.subscriptions;
CREATE POLICY "Users read own subscriptions" ON public.subscriptions
  FOR SELECT USING (user_id = auth.uid());

-- stripe_events: no policies at all -> only service role can touch it

-- ============================================================================
-- ACCESS HELPER
-- Returns 'subscription', 'trial' or 'expired' for a user.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_billing_access(p_user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_trial_start TIMESTAMPTZ;
  v_trial_ended BOOLEAN;
  -- Pricing page promises 14 days. app_settings.trial_duration_days says 33.
  -- Confirm the real value before going live.
  c_trial_days CONSTANT INTEGER := 14;
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.subscriptions s
    WHERE s.user_id = p_user_id
      AND s.status IN ('active', 'trialing', 'past_due')
      AND (s.current_period_end IS NULL OR s.current_period_end > NOW())
  ) THEN
    RETURN 'subscription';
  END IF;

  SELECT p.trial_start_date, COALESCE(p.trial_ended, FALSE)
    INTO v_trial_start, v_trial_ended
    FROM public.profiles p
   WHERE p.user_id = p_user_id;

  IF v_trial_start IS NOT NULL
     AND NOT v_trial_ended
     AND v_trial_start + make_interval(days => c_trial_days) > NOW() THEN
    RETURN 'trial';
  END IF;

  RETURN 'expired';
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_billing_access(UUID) TO authenticated;

-- updated_at trigger for subscriptions
CREATE OR REPLACE FUNCTION public.touch_subscriptions_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_updated_at_subscriptions ON public.subscriptions;
CREATE TRIGGER set_updated_at_subscriptions
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.touch_subscriptions_updated_at();
