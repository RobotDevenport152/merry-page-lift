CREATE TABLE public.sleep_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  answers JSONB NOT NULL,
  recommended_products TEXT[] NOT NULL DEFAULT '{}',
  reason_en TEXT,
  reason_zh TEXT,
  converted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.sleep_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit assessments"
ON public.sleep_assessments FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Admins can manage assessments"
ON public.sleep_assessments FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));