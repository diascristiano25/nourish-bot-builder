CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "plpgsql" WITH SCHEMA "pg_catalog";
CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: activity_level; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.activity_level AS ENUM (
    'sedentary',
    'light',
    'moderate',
    'active',
    'very_active'
);


--
-- Name: patient_goal; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.patient_goal AS ENUM (
    'hypertrophy',
    'weight_loss',
    'maintenance',
    'health',
    'performance'
);


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: anthropometrics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.anthropometrics (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    patient_id uuid NOT NULL,
    weight_kg numeric(5,2),
    height_cm numeric(5,2),
    body_fat_percentage numeric(4,1),
    waist_cm numeric(5,2),
    hip_cm numeric(5,2),
    measured_at timestamp with time zone DEFAULT now() NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: meal_plans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.meal_plans (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    patient_id uuid NOT NULL,
    nutritionist_id uuid NOT NULL,
    title text NOT NULL,
    description text,
    total_calories integer,
    plan_data jsonb DEFAULT '{}'::jsonb NOT NULL,
    is_active boolean DEFAULT true,
    valid_from date,
    valid_until date,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: nutritionists; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.nutritionists (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    full_name text NOT NULL,
    crn text,
    phone text,
    logo_url text,
    primary_color text DEFAULT '#4a7c59'::text,
    secondary_color text DEFAULT '#2d5a3d'::text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: patients; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.patients (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nutritionist_id uuid NOT NULL,
    full_name text NOT NULL,
    email text,
    phone text,
    birth_date date,
    gender text,
    goal public.patient_goal DEFAULT 'health'::public.patient_goal,
    activity_level public.activity_level DEFAULT 'moderate'::public.activity_level,
    allergies text[],
    dietary_restrictions text[],
    medical_conditions text,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: anthropometrics anthropometrics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.anthropometrics
    ADD CONSTRAINT anthropometrics_pkey PRIMARY KEY (id);


--
-- Name: meal_plans meal_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meal_plans
    ADD CONSTRAINT meal_plans_pkey PRIMARY KEY (id);


--
-- Name: nutritionists nutritionists_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nutritionists
    ADD CONSTRAINT nutritionists_pkey PRIMARY KEY (id);


--
-- Name: nutritionists nutritionists_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nutritionists
    ADD CONSTRAINT nutritionists_user_id_key UNIQUE (user_id);


--
-- Name: patients patients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_pkey PRIMARY KEY (id);


--
-- Name: meal_plans update_meal_plans_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_meal_plans_updated_at BEFORE UPDATE ON public.meal_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: nutritionists update_nutritionists_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_nutritionists_updated_at BEFORE UPDATE ON public.nutritionists FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: patients update_patients_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON public.patients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: anthropometrics anthropometrics_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.anthropometrics
    ADD CONSTRAINT anthropometrics_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;


--
-- Name: meal_plans meal_plans_nutritionist_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meal_plans
    ADD CONSTRAINT meal_plans_nutritionist_id_fkey FOREIGN KEY (nutritionist_id) REFERENCES public.nutritionists(id) ON DELETE CASCADE;


--
-- Name: meal_plans meal_plans_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meal_plans
    ADD CONSTRAINT meal_plans_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;


--
-- Name: nutritionists nutritionists_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nutritionists
    ADD CONSTRAINT nutritionists_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: patients patients_nutritionist_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_nutritionist_id_fkey FOREIGN KEY (nutritionist_id) REFERENCES public.nutritionists(id) ON DELETE CASCADE;


--
-- Name: anthropometrics Nutritionists can create anthropometrics for their patients; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Nutritionists can create anthropometrics for their patients" ON public.anthropometrics FOR INSERT WITH CHECK ((patient_id IN ( SELECT p.id
   FROM (public.patients p
     JOIN public.nutritionists n ON ((p.nutritionist_id = n.id)))
  WHERE (n.user_id = auth.uid()))));


--
-- Name: meal_plans Nutritionists can create meal plans; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Nutritionists can create meal plans" ON public.meal_plans FOR INSERT WITH CHECK ((nutritionist_id IN ( SELECT nutritionists.id
   FROM public.nutritionists
  WHERE (nutritionists.user_id = auth.uid()))));


--
-- Name: patients Nutritionists can create patients; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Nutritionists can create patients" ON public.patients FOR INSERT WITH CHECK ((nutritionist_id IN ( SELECT nutritionists.id
   FROM public.nutritionists
  WHERE (nutritionists.user_id = auth.uid()))));


--
-- Name: meal_plans Nutritionists can delete their meal plans; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Nutritionists can delete their meal plans" ON public.meal_plans FOR DELETE USING ((nutritionist_id IN ( SELECT nutritionists.id
   FROM public.nutritionists
  WHERE (nutritionists.user_id = auth.uid()))));


--
-- Name: patients Nutritionists can delete their own patients; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Nutritionists can delete their own patients" ON public.patients FOR DELETE USING ((nutritionist_id IN ( SELECT nutritionists.id
   FROM public.nutritionists
  WHERE (nutritionists.user_id = auth.uid()))));


--
-- Name: anthropometrics Nutritionists can delete their patients anthropometrics; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Nutritionists can delete their patients anthropometrics" ON public.anthropometrics FOR DELETE USING ((patient_id IN ( SELECT p.id
   FROM (public.patients p
     JOIN public.nutritionists n ON ((p.nutritionist_id = n.id)))
  WHERE (n.user_id = auth.uid()))));


--
-- Name: meal_plans Nutritionists can update their meal plans; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Nutritionists can update their meal plans" ON public.meal_plans FOR UPDATE USING ((nutritionist_id IN ( SELECT nutritionists.id
   FROM public.nutritionists
  WHERE (nutritionists.user_id = auth.uid()))));


--
-- Name: patients Nutritionists can update their own patients; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Nutritionists can update their own patients" ON public.patients FOR UPDATE USING ((nutritionist_id IN ( SELECT nutritionists.id
   FROM public.nutritionists
  WHERE (nutritionists.user_id = auth.uid()))));


--
-- Name: anthropometrics Nutritionists can update their patients anthropometrics; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Nutritionists can update their patients anthropometrics" ON public.anthropometrics FOR UPDATE USING ((patient_id IN ( SELECT p.id
   FROM (public.patients p
     JOIN public.nutritionists n ON ((p.nutritionist_id = n.id)))
  WHERE (n.user_id = auth.uid()))));


--
-- Name: meal_plans Nutritionists can view their meal plans; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Nutritionists can view their meal plans" ON public.meal_plans FOR SELECT USING ((nutritionist_id IN ( SELECT nutritionists.id
   FROM public.nutritionists
  WHERE (nutritionists.user_id = auth.uid()))));


--
-- Name: patients Nutritionists can view their own patients; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Nutritionists can view their own patients" ON public.patients FOR SELECT USING ((nutritionist_id IN ( SELECT nutritionists.id
   FROM public.nutritionists
  WHERE (nutritionists.user_id = auth.uid()))));


--
-- Name: anthropometrics Nutritionists can view their patients anthropometrics; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Nutritionists can view their patients anthropometrics" ON public.anthropometrics FOR SELECT USING ((patient_id IN ( SELECT p.id
   FROM (public.patients p
     JOIN public.nutritionists n ON ((p.nutritionist_id = n.id)))
  WHERE (n.user_id = auth.uid()))));


--
-- Name: nutritionists Users can create their own nutritionist profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own nutritionist profile" ON public.nutritionists FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: nutritionists Users can update their own nutritionist profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own nutritionist profile" ON public.nutritionists FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: nutritionists Users can view their own nutritionist profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own nutritionist profile" ON public.nutritionists FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: anthropometrics; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.anthropometrics ENABLE ROW LEVEL SECURITY;

--
-- Name: meal_plans; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;

--
-- Name: nutritionists; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.nutritionists ENABLE ROW LEVEL SECURITY;

--
-- Name: patients; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--


