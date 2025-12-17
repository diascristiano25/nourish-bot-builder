-- Remove public access policies that expose sensitive data

-- 1. Drop public policy on patients table
DROP POLICY IF EXISTS "Public can view patient basic info by id" ON public.patients;

-- 2. Drop public policy on meal_plans table  
DROP POLICY IF EXISTS "Public can view meal plans by patient_id" ON public.meal_plans;

-- 3. Drop public policy on weight_logs table
DROP POLICY IF EXISTS "Public can view weight logs by patient_id" ON public.weight_logs;

-- 4. Drop public policy on water_logs table (also exposed)
DROP POLICY IF EXISTS "Public can view water logs by patient_id" ON public.water_logs;