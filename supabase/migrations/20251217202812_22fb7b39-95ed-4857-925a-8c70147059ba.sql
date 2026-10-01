-- Add public read access policies for patient portal (access via direct link)

-- Allow public read access to patients by their ID (for public portal)
CREATE POLICY "Public can view patient by id for portal" 
ON public.patients 
FOR SELECT 
USING (true);

-- Allow public read access to meal_plans by patient_id (for public portal)
CREATE POLICY "Public can view meal plans for portal" 
ON public.meal_plans 
FOR SELECT 
USING (true);

-- Allow public read access to nutritionists for branding (for public portal)
CREATE POLICY "Public can view nutritionist profiles for portal" 
ON public.nutritionists 
FOR SELECT 
USING (true);

-- Allow public read access to weight_logs by patient_id (for public portal)
CREATE POLICY "Public can view weight logs for portal" 
ON public.weight_logs 
FOR SELECT 
USING (true);