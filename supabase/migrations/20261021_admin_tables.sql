-- Admin Panel Tables and Schema Changes
-- Created: 2026-10-21

-- Global settings key-value store
CREATE TABLE IF NOT EXISTS admin_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit log for admin actions
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  target_type TEXT,
  target_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add admin_notes column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;

-- Enable RLS
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS policies - admin only access
CREATE POLICY "Admin only access settings" ON admin_settings
  FOR ALL USING (auth.jwt()->>'email' = 'diascristianoconsultor@gmail.com');

CREATE POLICY "Admin only access audit log" ON admin_audit_log
  FOR ALL USING (auth.jwt()->>'email' = 'diascristianoconsultor@gmail.com')
  WITH CHECK (auth.jwt()->>'email' = 'diascristianoconsultor@gmail.com');

-- Insert default settings
INSERT INTO admin_settings (key, value) VALUES
  ('trial_duration_days', '33'),
  ('feature_flags', '{"ai_meal_plans": true, "chat": true, "paid_traffic": true}'),
  ('maintenance_mode', '{"enabled": false, "message": ""}')
ON CONFLICT (key) DO NOTHING;