-- Add email_signature column to nutritionists table
ALTER TABLE public.nutritionists 
ADD COLUMN IF NOT EXISTS email_signature text;

-- Create storage bucket for support ticket attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('ticket-attachments', 'ticket-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for ticket attachments bucket
CREATE POLICY "Nutritionists can upload their own attachments"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'ticket-attachments' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Nutritionists can view their own attachments"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'ticket-attachments'
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Admins can view all attachments"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'ticket-attachments'
  AND is_current_user_admin() = true
);

-- Add attachment_url column to support_tickets
ALTER TABLE public.support_tickets
ADD COLUMN IF NOT EXISTS attachment_url text;