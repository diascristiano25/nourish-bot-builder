-- Create financial_records table
CREATE TABLE public.financial_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nutritionist_id UUID NOT NULL REFERENCES public.nutritionists(id) ON DELETE CASCADE,
  record_type TEXT NOT NULL CHECK (record_type IN ('Receita', 'Despesa')),
  amount NUMERIC NOT NULL DEFAULT 0,
  description TEXT,
  record_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.financial_records ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Nutritionists can view their own financial records"
ON public.financial_records
FOR SELECT
USING (nutritionist_id IN (
  SELECT id FROM public.nutritionists WHERE user_id = auth.uid()
));

CREATE POLICY "Nutritionists can create their own financial records"
ON public.financial_records
FOR INSERT
WITH CHECK (nutritionist_id IN (
  SELECT id FROM public.nutritionists WHERE user_id = auth.uid()
));

CREATE POLICY "Nutritionists can update their own financial records"
ON public.financial_records
FOR UPDATE
USING (nutritionist_id IN (
  SELECT id FROM public.nutritionists WHERE user_id = auth.uid()
));

CREATE POLICY "Nutritionists can delete their own financial records"
ON public.financial_records
FOR DELETE
USING (nutritionist_id IN (
  SELECT id FROM public.nutritionists WHERE user_id = auth.uid()
));

-- Create trigger for updated_at
CREATE TRIGGER update_financial_records_updated_at
BEFORE UPDATE ON public.financial_records
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();