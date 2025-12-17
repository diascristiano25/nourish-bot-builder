-- Create support tickets table
CREATE TABLE public.support_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nutritionist_id UUID NOT NULL REFERENCES public.nutritionists(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  admin_response TEXT,
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Nutritionists can create and view their own tickets
CREATE POLICY "Nutritionists can create their own tickets"
ON public.support_tickets
FOR INSERT
WITH CHECK (nutritionist_id IN (
  SELECT id FROM public.nutritionists WHERE user_id = auth.uid()
));

CREATE POLICY "Nutritionists can view their own tickets"
ON public.support_tickets
FOR SELECT
USING (nutritionist_id IN (
  SELECT id FROM public.nutritionists WHERE user_id = auth.uid()
));

-- Admins can view and update all tickets
CREATE POLICY "Admins can view all tickets"
ON public.support_tickets
FOR SELECT
USING (is_current_user_admin() = true);

CREATE POLICY "Admins can update all tickets"
ON public.support_tickets
FOR UPDATE
USING (is_current_user_admin() = true);

-- Create index for faster queries
CREATE INDEX idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX idx_support_tickets_nutritionist ON public.support_tickets(nutritionist_id);