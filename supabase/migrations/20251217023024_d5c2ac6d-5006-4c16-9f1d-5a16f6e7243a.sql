-- Create appointments table
CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  nutritionist_id UUID NOT NULL,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  date_time TIMESTAMP WITH TIME ZONE NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled'))
);

-- Enable RLS
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Nutritionists can view their own appointments"
ON public.appointments FOR SELECT
USING (nutritionist_id IN (
  SELECT id FROM nutritionists WHERE user_id = auth.uid()
));

CREATE POLICY "Nutritionists can create appointments"
ON public.appointments FOR INSERT
WITH CHECK (nutritionist_id IN (
  SELECT id FROM nutritionists WHERE user_id = auth.uid()
));

CREATE POLICY "Nutritionists can update their appointments"
ON public.appointments FOR UPDATE
USING (nutritionist_id IN (
  SELECT id FROM nutritionists WHERE user_id = auth.uid()
));

CREATE POLICY "Nutritionists can delete their appointments"
ON public.appointments FOR DELETE
USING (nutritionist_id IN (
  SELECT id FROM nutritionists WHERE user_id = auth.uid()
));

-- Create index for faster queries
CREATE INDEX idx_appointments_nutritionist_date ON public.appointments (nutritionist_id, date_time);
CREATE INDEX idx_appointments_patient ON public.appointments (patient_id);