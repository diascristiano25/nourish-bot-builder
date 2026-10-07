-- ========================================
-- CRIAR TABELAS FALTANTES NO SUPABASE
-- ========================================
-- Este script cria as tabelas que estão faltando e causando erros 404

-- 1. Tabela de agendamentos (appointments)
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    nutritionist_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')),
    type TEXT DEFAULT 'consultation' CHECK (type IN ('consultation', 'follow_up', 'initial')),
    notes TEXT,
    reminder_sent BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela de alimentos personalizados (custom_foods)
CREATE TABLE IF NOT EXISTS public.custom_foods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nutritionist_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT,
    calories NUMERIC,
    protein NUMERIC,
    carbs NUMERIC,
    fat NUMERIC,
    fiber NUMERIC,
    serving_size TEXT,
    unit TEXT DEFAULT 'g',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela de mensagens (messages)
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    nutritionist_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    sender_type TEXT NOT NULL CHECK (sender_type IN ('patient', 'nutritionist')),
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- ÍNDICES PARA PERFORMANCE
-- ========================================

-- Appointments
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON public.appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_nutritionist_id ON public.appointments(nutritionist_id);
CREATE INDEX IF NOT EXISTS idx_appointments_scheduled_at ON public.appointments(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);

-- Custom Foods
CREATE INDEX IF NOT EXISTS idx_custom_foods_nutritionist_id ON public.custom_foods(nutritionist_id);
CREATE INDEX IF NOT EXISTS idx_custom_foods_category ON public.custom_foods(category);
CREATE INDEX IF NOT EXISTS idx_custom_foods_is_active ON public.custom_foods(is_active);

-- Messages
CREATE INDEX IF NOT EXISTS idx_messages_patient_id ON public.messages(patient_id);
CREATE INDEX IF NOT EXISTS idx_messages_nutritionist_id ON public.messages(nutritionist_id);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON public.messages(is_read);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);

-- ========================================
-- ROW LEVEL SECURITY (RLS)
-- ========================================

-- Appointments
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Nutricionistas podem ver próprios agendamentos"
    ON public.appointments FOR SELECT
    USING (auth.uid() = nutritionist_id);

CREATE POLICY "Nutricionistas podem inserir próprios agendamentos"
    ON public.appointments FOR INSERT
    WITH CHECK (auth.uid() = nutritionist_id);

CREATE POLICY "Nutricionistas podem atualizar próprios agendamentos"
    ON public.appointments FOR UPDATE
    USING (auth.uid() = nutritionist_id);

CREATE POLICY "Nutricionistas podem deletar próprios agendamentos"
    ON public.appointments FOR DELETE
    USING (auth.uid() = nutritionist_id);

-- Custom Foods
ALTER TABLE public.custom_foods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Nutricionistas podem ver próprios alimentos"
    ON public.custom_foods FOR SELECT
    USING (auth.uid() = nutritionist_id);

CREATE POLICY "Nutricionistas podem inserir próprios alimentos"
    ON public.custom_foods FOR INSERT
    WITH CHECK (auth.uid() = nutritionist_id);

CREATE POLICY "Nutricionistas podem atualizar próprios alimentos"
    ON public.custom_foods FOR UPDATE
    USING (auth.uid() = nutritionist_id);

CREATE POLICY "Nutricionistas podem deletar próprios alimentos"
    ON public.custom_foods FOR DELETE
    USING (auth.uid() = nutritionist_id);

-- Messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Nutricionistas podem ver próprias mensagens"
    ON public.messages FOR SELECT
    USING (auth.uid() = nutritionist_id);

CREATE POLICY "Nutricionistas podem inserir mensagens"
    ON public.messages FOR INSERT
    WITH CHECK (auth.uid() = nutritionist_id);

CREATE POLICY "Nutricionistas podem atualizar próprias mensagens"
    ON public.messages FOR UPDATE
    USING (auth.uid() = nutritionist_id);

-- ========================================
-- TRIGGERS PARA UPDATED_AT
-- ========================================

CREATE TRIGGER update_appointments_updated_at
    BEFORE UPDATE ON public.appointments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_custom_foods_updated_at
    BEFORE UPDATE ON public.custom_foods
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- VERIFICAÇÃO FINAL
-- ========================================

-- Ver todas as tabelas criadas
SELECT
    'appointments' as table_name,
    COUNT(*) as row_count
FROM public.appointments
UNION ALL
SELECT
    'custom_foods' as table_name,
    COUNT(*) as row_count
FROM public.custom_foods
UNION ALL
SELECT
    'messages' as table_name,
    COUNT(*) as row_count
FROM public.messages;
