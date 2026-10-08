-- Migration: Add 7 missing tables identified by schema audit
-- Created: 2026-10-08
-- Task 2: Schema Fix Migration
--
-- This migration adds tables that are referenced in the codebase but missing from the database:
-- 1. weight_logs - Patient weight tracking over time
-- 2. water_logs - Patient water intake tracking
-- 3. support_tickets - Support ticket system
-- 4. support_ticket_messages - Support ticket conversation threads
-- 5. financial_records - Financial transaction records
-- 6. payment_events - Stripe payment webhook events
-- 7. purchase_events - Purchase transaction events

-- ============================================================================
-- 1. WEIGHT LOGS TABLE
-- ============================================================================
-- Tracks patient weight measurements over time for progress monitoring

CREATE TABLE IF NOT EXISTS public.weight_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  weight DECIMAL(5,2) NOT NULL, -- Weight in kg (e.g., 75.50)
  measured_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_weight_logs_patient_id ON public.weight_logs(patient_id);
CREATE INDEX IF NOT EXISTS idx_weight_logs_measured_at ON public.weight_logs(measured_at DESC);
CREATE INDEX IF NOT EXISTS idx_weight_logs_patient_measured ON public.weight_logs(patient_id, measured_at DESC);

-- RLS Policies
ALTER TABLE public.weight_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own weight logs"
  ON public.weight_logs FOR SELECT
  USING (
    patient_id IN (
      SELECT id FROM public.patients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own weight logs"
  ON public.weight_logs FOR INSERT
  WITH CHECK (
    patient_id IN (
      SELECT id FROM public.patients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own weight logs"
  ON public.weight_logs FOR UPDATE
  USING (
    patient_id IN (
      SELECT id FROM public.patients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own weight logs"
  ON public.weight_logs FOR DELETE
  USING (
    patient_id IN (
      SELECT id FROM public.patients WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- 2. WATER LOGS TABLE
-- ============================================================================
-- Tracks patient daily water intake for hydration monitoring

CREATE TABLE IF NOT EXISTS public.water_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  amount_ml INTEGER NOT NULL, -- Water amount in milliliters
  logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_water_logs_patient_id ON public.water_logs(patient_id);
CREATE INDEX IF NOT EXISTS idx_water_logs_logged_at ON public.water_logs(logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_water_logs_patient_logged ON public.water_logs(patient_id, logged_at DESC);

-- RLS Policies
ALTER TABLE public.water_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own water logs"
  ON public.water_logs FOR SELECT
  USING (
    patient_id IN (
      SELECT id FROM public.patients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own water logs"
  ON public.water_logs FOR INSERT
  WITH CHECK (
    patient_id IN (
      SELECT id FROM public.patients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own water logs"
  ON public.water_logs FOR UPDATE
  USING (
    patient_id IN (
      SELECT id FROM public.patients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own water logs"
  ON public.water_logs FOR DELETE
  USING (
    patient_id IN (
      SELECT id FROM public.patients WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- 3. SUPPORT TICKETS TABLE
-- ============================================================================
-- Support ticket system for patient questions and nutritionist support

CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  category TEXT, -- e.g., 'billing', 'technical', 'nutrition', 'account'
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Assigned support agent/nutritionist
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON public.support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_patient_id ON public.support_tickets(patient_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned_to ON public.support_tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON public.support_tickets(created_at DESC);

-- RLS Policies
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tickets"
  ON public.support_tickets FOR SELECT
  USING (user_id = auth.uid() OR assigned_to = auth.uid());

CREATE POLICY "Users can create own tickets"
  ON public.support_tickets FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own tickets"
  ON public.support_tickets FOR UPDATE
  USING (user_id = auth.uid() OR assigned_to = auth.uid());

-- ============================================================================
-- 4. SUPPORT TICKET MESSAGES TABLE
-- ============================================================================
-- Conversation threads for support tickets

CREATE TABLE IF NOT EXISTS public.support_ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_staff_reply BOOLEAN NOT NULL DEFAULT FALSE,
  attachments JSONB, -- Array of file URLs/metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_support_messages_ticket_id ON public.support_ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_support_messages_created_at ON public.support_ticket_messages(created_at);

-- RLS Policies
ALTER TABLE public.support_ticket_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages of their tickets"
  ON public.support_ticket_messages FOR SELECT
  USING (
    ticket_id IN (
      SELECT id FROM public.support_tickets
      WHERE user_id = auth.uid() OR assigned_to = auth.uid()
    )
  );

CREATE POLICY "Users can create messages on their tickets"
  ON public.support_ticket_messages FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    ticket_id IN (
      SELECT id FROM public.support_tickets
      WHERE user_id = auth.uid() OR assigned_to = auth.uid()
    )
  );

-- ============================================================================
-- 5. FINANCIAL RECORDS TABLE
-- ============================================================================
-- Financial transaction records for business tracking

CREATE TABLE IF NOT EXISTS public.financial_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('payment', 'refund', 'subscription', 'consultation')),
  amount INTEGER NOT NULL, -- Amount in cents (e.g., 9900 = R$ 99.00)
  currency TEXT NOT NULL DEFAULT 'BRL',
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  payment_method TEXT, -- e.g., 'credit_card', 'pix', 'boleto'
  stripe_payment_intent_id TEXT,
  description TEXT,
  metadata JSONB,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_financial_records_user_id ON public.financial_records(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_records_patient_id ON public.financial_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_financial_records_status ON public.financial_records(status);
CREATE INDEX IF NOT EXISTS idx_financial_records_stripe_id ON public.financial_records(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_financial_records_created_at ON public.financial_records(created_at DESC);

-- RLS Policies
ALTER TABLE public.financial_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own financial records"
  ON public.financial_records FOR SELECT
  USING (user_id = auth.uid());

-- ============================================================================
-- 6. PAYMENT EVENTS TABLE
-- ============================================================================
-- Stripe webhook payment events for audit trail

CREATE TABLE IF NOT EXISTS public.payment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL, -- e.g., 'payment_intent.succeeded', 'charge.refunded'
  payment_intent_id TEXT,
  customer_id TEXT,
  amount INTEGER, -- Amount in cents
  currency TEXT DEFAULT 'BRL',
  status TEXT,
  metadata JSONB,
  raw_event JSONB NOT NULL, -- Full Stripe event payload
  processed BOOLEAN NOT NULL DEFAULT FALSE,
  processed_at TIMESTAMPTZ,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payment_events_stripe_event_id ON public.payment_events(stripe_event_id);
CREATE INDEX IF NOT EXISTS idx_payment_events_payment_intent ON public.payment_events(payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payment_events_customer_id ON public.payment_events(customer_id);
CREATE INDEX IF NOT EXISTS idx_payment_events_processed ON public.payment_events(processed);
CREATE INDEX IF NOT EXISTS idx_payment_events_created_at ON public.payment_events(created_at DESC);

-- RLS Policies (service role only - no user access)
ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;

-- No SELECT policy - only service role can access
CREATE POLICY "Service role can insert payment events"
  ON public.payment_events FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- ============================================================================
-- 7. PURCHASE EVENTS TABLE
-- ============================================================================
-- Purchase transaction events for business analytics

CREATE TABLE IF NOT EXISTS public.purchase_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
  product_type TEXT NOT NULL CHECK (product_type IN ('consultation', 'meal_plan', 'subscription', 'package')),
  product_id TEXT, -- Reference to specific product
  amount INTEGER NOT NULL, -- Amount in cents
  currency TEXT NOT NULL DEFAULT 'BRL',
  payment_status TEXT NOT NULL CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  stripe_payment_intent_id TEXT,
  metadata JSONB,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_purchase_events_user_id ON public.purchase_events(user_id);
CREATE INDEX IF NOT EXISTS idx_purchase_events_patient_id ON public.purchase_events(patient_id);
CREATE INDEX IF NOT EXISTS idx_purchase_events_product_type ON public.purchase_events(product_type);
CREATE INDEX IF NOT EXISTS idx_purchase_events_payment_status ON public.purchase_events(payment_status);
CREATE INDEX IF NOT EXISTS idx_purchase_events_stripe_id ON public.purchase_events(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_purchase_events_created_at ON public.purchase_events(created_at DESC);

-- RLS Policies
ALTER TABLE public.purchase_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own purchase events"
  ON public.purchase_events FOR SELECT
  USING (user_id = auth.uid());

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_weight_logs
  BEFORE UPDATE ON public.weight_logs
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_water_logs
  BEFORE UPDATE ON public.water_logs
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_support_tickets
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_support_ticket_messages
  BEFORE UPDATE ON public.support_ticket_messages
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_financial_records
  BEFORE UPDATE ON public.financial_records
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_purchase_events
  BEFORE UPDATE ON public.purchase_events
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- NOTIFY POSTGREST TO RELOAD SCHEMA CACHE
-- ============================================================================

NOTIFY pgrst, 'reload schema';
