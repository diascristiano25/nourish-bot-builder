-- Add trial columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trial_start_date TIMESTAMP;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trial_ended BOOLEAN DEFAULT false;

-- Create trial_events table for tracking usage
CREATE TABLE IF NOT EXISTS trial_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  event_type VARCHAR(50), -- 'trial_started', 'alert_shown', 'plan_viewed', 'signup'
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create index for quick lookups
CREATE INDEX IF NOT EXISTS idx_trial_events_user_id ON trial_events(user_id);
CREATE INDEX IF NOT EXISTS idx_trial_events_created_at ON trial_events(created_at);

-- RLS policies
ALTER TABLE trial_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own trial events"
  ON trial_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert trial events"
  ON trial_events FOR INSERT
  WITH CHECK (true);
