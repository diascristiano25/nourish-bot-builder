-- ============================================
-- MIGRATION: Fix Schema Inconsistencies
-- Date: 2026-10-08
-- Purpose: Add missing columns, tables, and RLS policies identified in audit
-- ============================================

-- Fix: Add missing trial_start_date column to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS trial_start_date TIMESTAMPTZ;

COMMENT ON COLUMN public.profiles.trial_start_date IS 'Date when the trial period started';

-- Fix: Add missing trial_ended column to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS trial_ended BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN public.profiles.trial_ended IS 'Whether the trial period has ended';

-- Fix: Create purchase_events table (referenced in stripe-webhooks.ts)
CREATE TABLE IF NOT EXISTS public.purchase_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    stripe_event_id TEXT UNIQUE,
    amount INTEGER,
    currency TEXT,
    product_id TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on purchase_events
ALTER TABLE public.purchase_events ENABLE ROW LEVEL SECURITY;

-- RLS: Users can view their own purchase events
CREATE POLICY IF NOT EXISTS "users_view_own_purchase_events"
ON public.purchase_events FOR SELECT
USING (auth.uid() = user_id);

-- RLS: Service role can insert purchase events
CREATE POLICY IF NOT EXISTS "service_insert_purchase_events"
ON public.purchase_events FOR INSERT
WITH CHECK (true);

-- Fix: Create payment_events table (referenced in stripe-webhooks.ts)
CREATE TABLE IF NOT EXISTS public.payment_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    stripe_event_id TEXT UNIQUE,
    payment_intent_id TEXT,
    amount INTEGER,
    currency TEXT,
    status TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on payment_events
ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;

-- RLS: Users can view their own payment events
CREATE POLICY IF NOT EXISTS "users_view_own_payment_events"
ON public.payment_events FOR SELECT
USING (auth.uid() = user_id);

-- RLS: Service role can insert payment events
CREATE POLICY IF NOT EXISTS "service_insert_payment_events"
ON public.payment_events FOR INSERT
WITH CHECK (true);

-- CRITICAL: Force PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';

-- Verification query
SELECT 'Migration completed successfully' as status,
       NOW() as executed_at;
