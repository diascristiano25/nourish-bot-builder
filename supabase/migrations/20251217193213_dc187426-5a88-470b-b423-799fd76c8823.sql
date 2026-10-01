-- Add ticket_number to support_tickets
ALTER TABLE public.support_tickets 
ADD COLUMN ticket_number SERIAL UNIQUE;

-- Create support_ticket_messages table for conversation
CREATE TABLE public.support_ticket_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('nutritionist', 'admin')),
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.support_ticket_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for messages
CREATE POLICY "Nutritionists can view messages of their tickets"
ON public.support_ticket_messages
FOR SELECT
USING (ticket_id IN (
  SELECT id FROM public.support_tickets 
  WHERE nutritionist_id IN (
    SELECT id FROM public.nutritionists WHERE user_id = auth.uid()
  )
));

CREATE POLICY "Nutritionists can create messages on their tickets"
ON public.support_ticket_messages
FOR INSERT
WITH CHECK (
  sender_type = 'nutritionist' AND
  ticket_id IN (
    SELECT id FROM public.support_tickets 
    WHERE nutritionist_id IN (
      SELECT id FROM public.nutritionists WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Admins can view all messages"
ON public.support_ticket_messages
FOR SELECT
USING (is_current_user_admin() = true);

CREATE POLICY "Admins can create messages"
ON public.support_ticket_messages
FOR INSERT
WITH CHECK (is_current_user_admin() = true AND sender_type = 'admin');

-- Index for performance
CREATE INDEX idx_ticket_messages_ticket_id ON public.support_ticket_messages(ticket_id);

-- Update status check constraint
ALTER TABLE public.support_tickets DROP CONSTRAINT IF EXISTS support_tickets_status_check;
ALTER TABLE public.support_tickets ADD CONSTRAINT support_tickets_status_check 
CHECK (status IN ('open', 'answered', 'closed'));