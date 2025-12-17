-- Remove overly permissive public policies that expose sensitive data

DROP POLICY IF EXISTS "Public can view patient by id for portal" ON public.patients;
DROP POLICY IF EXISTS "Public can view meal plans for portal" ON public.meal_plans;
DROP POLICY IF EXISTS "Public can view nutritionist profiles for portal" ON public.nutritionists;
DROP POLICY IF EXISTS "Public can view weight logs for portal" ON public.weight_logs;