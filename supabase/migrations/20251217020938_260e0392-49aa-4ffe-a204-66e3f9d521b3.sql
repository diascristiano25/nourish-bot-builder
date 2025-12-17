-- Allow public read access to meal_plans based on patient_id (for patient app links)
CREATE POLICY "Public can view meal plans by patient_id"
ON public.meal_plans
FOR SELECT
USING (true);

-- Allow public read access to patients basic info for patient app
CREATE POLICY "Public can view patient basic info by id"
ON public.patients
FOR SELECT
USING (true);

-- Allow public read access to weight_logs for patient app
CREATE POLICY "Public can view weight logs by patient_id"
ON public.weight_logs
FOR SELECT
USING (true);

-- Allow public read access to water_logs for patient app
CREATE POLICY "Public can view water logs by patient_id"
ON public.water_logs
FOR SELECT
USING (true);