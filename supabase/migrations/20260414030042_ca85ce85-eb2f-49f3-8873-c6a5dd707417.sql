
-- 1. FIX PROFILES PRIVILEGE ESCALATION
-- Drop the existing permissive update policy that allows users to change any column
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Recreate with WITH CHECK to prevent admin field manipulation
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND is_admin = (SELECT p.is_admin FROM public.profiles p WHERE p.user_id = auth.uid())
  AND is_master_admin = (SELECT p.is_master_admin FROM public.profiles p WHERE p.user_id = auth.uid())
  AND account_status = (SELECT p.account_status FROM public.profiles p WHERE p.user_id = auth.uid())
  AND is_active = (SELECT p.is_active FROM public.profiles p WHERE p.user_id = auth.uid())
);

-- 2. ADD PATIENT ACCESS TO ANTHROPOMETRICS (their own data)
CREATE POLICY "Patients can view their own anthropometrics"
ON public.anthropometrics
FOR SELECT
USING (patient_id IN (
  SELECT id FROM public.patients WHERE user_id = auth.uid()
));

-- 3. ADD STORAGE UPDATE POLICY FOR TICKET-ATTACHMENTS
CREATE POLICY "Users can update their own ticket attachments"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'ticket-attachments'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
