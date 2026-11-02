-- Add admin_user_id to admin_audit_log for visual timeline attribution
-- Created: 2026-11-02

ALTER TABLE admin_audit_log ADD COLUMN IF NOT EXISTS admin_user_id UUID REFERENCES auth.users(id);

-- Index for faster lookups by admin user
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_admin_user ON admin_audit_log(admin_user_id);

-- Update RLS policy to allow insert with admin_user_id
DROP POLICY IF EXISTS "Admin only access audit log" ON admin_audit_log;
CREATE POLICY "Admin only access audit log" ON admin_audit_log
  FOR ALL USING (auth.jwt()->>'email' = 'diascristianoconsultor@gmail.com')
  WITH CHECK (auth.jwt()->>'email' = 'diascristianoconsultor@gmail.com');