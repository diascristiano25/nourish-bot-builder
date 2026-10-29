-- Tabela para exames laboratoriais
CREATE TABLE IF NOT EXISTS lab_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  exam_date DATE NOT NULL,
  exam_type TEXT NOT NULL, -- 'hemograma', 'glicemia', 'colesterol', 'triglicerideos', 'tsh', 'ureia', 'creatinina', 'outro'
  value NUMERIC(10,2),
  unit TEXT,
  reference_range TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE lab_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can view own lab results" ON lab_results
  FOR SELECT USING (auth.uid() = patient_id);

CREATE POLICY "Nutritionists can manage patient lab results" ON lab_results
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM patients p
      JOIN profiles pr ON p.nutritionist_id = pr.id
      WHERE p.id = lab_results.patient_id AND pr.user_id = auth.uid()
    )
  );

-- Adicionar campos de dobras cutâneas na tabela anthropometrics
ALTER TABLE anthropometrics ADD COLUMN IF NOT EXISTS triceps_skinfold_mm NUMERIC(5,1);
ALTER TABLE anthropometrics ADD COLUMN IF NOT EXISTS biceps_skinfold_mm NUMERIC(5,1);
ALTER TABLE anthropometrics ADD COLUMN IF NOT EXISTS subscapular_skinfold_mm NUMERIC(5,1);
ALTER TABLE anthropometrics ADD COLUMN IF NOT EXISTS suprailiac_skinfold_mm NUMERIC(5,1);
ALTER TABLE anthropometrics ADD COLUMN IF NOT EXISTS abdominal_skinfold_mm NUMERIC(5,1);
ALTER TABLE anthropometrics ADD COLUMN IF NOT EXISTS thigh_skinfold_mm NUMERIC(5,1);
ALTER TABLE anthropometrics ADD COLUMN IF NOT EXISTS chest_skinfold_mm NUMERIC(5,1);
ALTER TABLE anthropometrics ADD COLUMN IF NOT EXISTS axillary_skinfold_mm NUMERIC(5,1);