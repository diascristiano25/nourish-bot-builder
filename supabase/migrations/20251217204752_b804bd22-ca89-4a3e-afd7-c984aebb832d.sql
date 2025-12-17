-- Drop existing block policies and recreate with proper conditions
DROP POLICY IF EXISTS "Block anonymous access to patients" ON public.patients;
DROP POLICY IF EXISTS "Block anonymous access to anthropometrics" ON public.anthropometrics;
DROP POLICY IF EXISTS "Block anonymous access to appointments" ON public.appointments;

-- Recreate with both USING and WITH CHECK for complete protection
-- Patients table - separate policies for each operation type
CREATE POLICY "Block anon select patients" ON public.patients FOR SELECT TO anon USING (false);
CREATE POLICY "Block anon insert patients" ON public.patients FOR INSERT TO anon WITH CHECK (false);
CREATE POLICY "Block anon update patients" ON public.patients FOR UPDATE TO anon USING (false) WITH CHECK (false);
CREATE POLICY "Block anon delete patients" ON public.patients FOR DELETE TO anon USING (false);

-- Anthropometrics table
CREATE POLICY "Block anon select anthropometrics" ON public.anthropometrics FOR SELECT TO anon USING (false);
CREATE POLICY "Block anon insert anthropometrics" ON public.anthropometrics FOR INSERT TO anon WITH CHECK (false);
CREATE POLICY "Block anon update anthropometrics" ON public.anthropometrics FOR UPDATE TO anon USING (false) WITH CHECK (false);
CREATE POLICY "Block anon delete anthropometrics" ON public.anthropometrics FOR DELETE TO anon USING (false);

-- Appointments table
CREATE POLICY "Block anon select appointments" ON public.appointments FOR SELECT TO anon USING (false);
CREATE POLICY "Block anon insert appointments" ON public.appointments FOR INSERT TO anon WITH CHECK (false);
CREATE POLICY "Block anon update appointments" ON public.appointments FOR UPDATE TO anon USING (false) WITH CHECK (false);
CREATE POLICY "Block anon delete appointments" ON public.appointments FOR DELETE TO anon USING (false);