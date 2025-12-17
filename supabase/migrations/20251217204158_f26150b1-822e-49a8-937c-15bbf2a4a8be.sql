-- Add default DENY policies for anonymous users on sensitive tables

-- Block anonymous access to patients table
CREATE POLICY "Block anonymous access to patients"
ON public.patients
FOR ALL
TO anon
USING (false);

-- Block anonymous access to anthropometrics table
CREATE POLICY "Block anonymous access to anthropometrics"
ON public.anthropometrics
FOR ALL
TO anon
USING (false);

-- Block anonymous access to appointments table
CREATE POLICY "Block anonymous access to appointments"
ON public.appointments
FOR ALL
TO anon
USING (false);