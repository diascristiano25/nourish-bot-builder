-- Add priority field to support_tickets
ALTER TABLE public.support_tickets 
ADD COLUMN priority TEXT NOT NULL DEFAULT 'normal' 
CHECK (priority IN ('low', 'normal', 'high', 'urgent'));

-- Create index for better performance on common queries
CREATE INDEX idx_support_tickets_priority ON public.support_tickets(priority);
CREATE INDEX idx_support_tickets_status_priority ON public.support_tickets(status, priority);