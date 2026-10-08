-- ========================================
-- ADD ACTIVITY_LEVEL COLUMN TO PATIENTS TABLE
-- ========================================
-- This script adds the missing activity_level column to the patients table

DO $$
BEGIN
  -- Check if column exists before adding
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'patients'
      AND column_name = 'activity_level'
  ) THEN
    -- Add the column
    ALTER TABLE public.patients
    ADD COLUMN activity_level TEXT DEFAULT 'moderado';

    RAISE NOTICE '✅ Column activity_level added to patients table with default value "moderado"';
  ELSE
    RAISE NOTICE '⚠️  Column activity_level already exists in patients table';
  END IF;
END $$;

-- Verify the column was added
SELECT 'Verification:' AS status;
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'patients'
  AND column_name = 'activity_level';

-- Show a sample of the patients table structure
SELECT 'Patients table structure:' AS status;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'patients'
ORDER BY ordinal_position;
