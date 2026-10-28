ALTER TABLE appointments ADD COLUMN IF NOT EXISTS reminder_sent_at TIMESTAMPTZ;
CREATE INDEX idx_appointments_reminder ON appointments(start_time, reminder_sent_at) WHERE reminder_sent_at IS NULL;