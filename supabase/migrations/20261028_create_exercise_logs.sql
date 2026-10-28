CREATE TABLE IF NOT EXISTS exercise_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  type TEXT NOT NULL,
  duration_min INTEGER NOT NULL CHECK (duration_min > 0),
  intensity TEXT CHECK (intensity IN ('light', 'moderate', 'vigorous')),
  calories_burned NUMERIC(8,2),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE exercise_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can manage own exercises" ON exercise_logs
  FOR ALL USING (auth.uid() = patient_id);