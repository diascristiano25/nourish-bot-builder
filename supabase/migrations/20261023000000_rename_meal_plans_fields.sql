-- Migration: Rename meal_plans fields to match codebase standard
-- client_id → patient_id
-- status → is_active

-- Step 1: Drop RLS policies that depend on old columns
DROP POLICY IF EXISTS "Patients can view own meal plans" ON meal_plans;
DROP POLICY IF EXISTS "Nutritionists can create meal plans" ON meal_plans;
DROP POLICY IF EXISTS "Nutritionists can update their own patients meal plans" ON meal_plans;
DROP POLICY IF EXISTS "Nutritionists can view their patients meal plans" ON meal_plans;
DROP POLICY IF EXISTS "Nutritionists can delete their patients meal plans" ON meal_plans;

-- Step 2: Add new columns
ALTER TABLE meal_plans
  ADD COLUMN IF NOT EXISTS patient_id UUID,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Step 3: Copy data from old columns
UPDATE meal_plans
  SET patient_id = client_id,
      is_active = CASE
        WHEN status = 'active' THEN true
        WHEN status = 'inactive' THEN false
        ELSE true
      END
  WHERE patient_id IS NULL;

-- Step 4: Add FK constraint on patient_id
ALTER TABLE meal_plans
  ADD CONSTRAINT meal_plans_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES patients(id);

-- Step 5: Make patient_id NOT NULL (after data copy)
ALTER TABLE meal_plans
  ALTER COLUMN patient_id SET NOT NULL;

-- Step 6: Drop old columns
ALTER TABLE meal_plans
  DROP COLUMN IF EXISTS client_id CASCADE,
  DROP COLUMN IF EXISTS status;

-- Step 7: Add index on patient_id for query performance
CREATE INDEX IF NOT EXISTS idx_meal_plans_patient_id ON meal_plans(patient_id);

-- Step 8: Recreate RLS policies with new column names
CREATE POLICY "Patients can view own meal plans"
  ON meal_plans FOR SELECT
  USING (patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid()));

CREATE POLICY "Nutritionists can create meal plans"
  ON meal_plans FOR INSERT
  WITH CHECK (
    patient_id IN (
      SELECT p.id FROM patients p
      JOIN profiles pr ON pr.id = p.nutritionist_id
      WHERE pr.user_id = auth.uid()
    )
  );

CREATE POLICY "Nutritionists can update their own patients meal plans"
  ON meal_plans FOR UPDATE
  USING (
    patient_id IN (
      SELECT p.id FROM patients p
      JOIN profiles pr ON pr.id = p.nutritionist_id
      WHERE pr.user_id = auth.uid()
    )
  );

CREATE POLICY "Nutritionists can view their patients meal plans"
  ON meal_plans FOR SELECT
  USING (
    patient_id IN (
      SELECT p.id FROM patients p
      JOIN profiles pr ON pr.id = p.nutritionist_id
      WHERE pr.user_id = auth.uid()
    )
  );

CREATE POLICY "Nutritionists can delete their patients meal plans"
  ON meal_plans FOR DELETE
  USING (
    patient_id IN (
      SELECT p.id FROM patients p
      JOIN profiles pr ON pr.id = p.nutritionist_id
      WHERE pr.user_id = auth.uid()
    )
  );

COMMENT ON COLUMN meal_plans.patient_id IS 'Foreign key to patients table (renamed from client_id)';
COMMENT ON COLUMN meal_plans.is_active IS 'Active status flag (migrated from status text field)';
