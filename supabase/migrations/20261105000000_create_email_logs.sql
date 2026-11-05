-- Create email_logs table for tracking automated emails
-- Created: 2026-11-05

CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email_type TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Index for idempotency checks (user_id + email_type)
CREATE INDEX IF NOT EXISTS idx_email_logs_user_type ON email_logs(user_id, email_type);

-- Index for cron queries (finding recent or scheduled emails)
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON email_logs(sent_at);

-- Enable RLS
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- Policy allowing service_role full access
CREATE POLICY "Service role full access email_logs" ON email_logs
  FOR ALL USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');