ALTER TABLE appointments ADD COLUMN IF NOT EXISTS video_room_id UUID;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS is_video_enabled BOOLEAN DEFAULT false;