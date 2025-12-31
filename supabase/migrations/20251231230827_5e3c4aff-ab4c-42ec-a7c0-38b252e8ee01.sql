-- Create messages table for patient-nutritionist communication
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  nutritionist_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('patient', 'nutritionist')),
  content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Patients can view their own messages
CREATE POLICY "Patients can view their own messages"
ON public.messages
FOR SELECT
USING (
  patient_id IN (
    SELECT id FROM public.patients WHERE user_id = auth.uid()
  )
);

-- Patients can send messages (insert as patient)
CREATE POLICY "Patients can send messages"
ON public.messages
FOR INSERT
WITH CHECK (
  sender_type = 'patient' AND
  patient_id IN (
    SELECT id FROM public.patients WHERE user_id = auth.uid()
  )
);

-- Patients can mark messages as read
CREATE POLICY "Patients can update read status"
ON public.messages
FOR UPDATE
USING (
  patient_id IN (
    SELECT id FROM public.patients WHERE user_id = auth.uid()
  )
);

-- Nutritionists can view messages from their patients
CREATE POLICY "Nutritionists can view their patients messages"
ON public.messages
FOR SELECT
USING (
  nutritionist_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
);

-- Nutritionists can send messages to their patients
CREATE POLICY "Nutritionists can send messages"
ON public.messages
FOR INSERT
WITH CHECK (
  sender_type = 'nutritionist' AND
  nutritionist_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
);

-- Nutritionists can update messages (mark as read)
CREATE POLICY "Nutritionists can update messages"
ON public.messages
FOR UPDATE
USING (
  nutritionist_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Create index for faster queries
CREATE INDEX idx_messages_patient_id ON public.messages(patient_id);
CREATE INDEX idx_messages_nutritionist_id ON public.messages(nutritionist_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at DESC);