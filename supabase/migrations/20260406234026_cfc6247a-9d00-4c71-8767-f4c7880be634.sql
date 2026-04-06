-- Drop and recreate view with correct column order
DROP VIEW IF EXISTS public.public_fiber_batches;

CREATE VIEW public.public_fiber_batches AS
  SELECT
    batch_code,
    farm_name,
    region,
    shearing_date,
    fiber_grade,
    micron_measurement,
    processing_date,
    product_type,
    manufacturing_date,
    status,
    weight_kg,
    created_at
  FROM public.fiber_batches;

GRANT SELECT ON public.public_fiber_batches TO anon, authenticated;

-- P1: Out-of-stock notifications
CREATE TABLE IF NOT EXISTS public.stock_notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  email      TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notified_at TIMESTAMPTZ,
  UNIQUE(product_id, email)
);

ALTER TABLE public.stock_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can subscribe to stock notifications"
  ON public.stock_notifications FOR INSERT
  WITH CHECK (length(email) > 3);

CREATE POLICY "Admins can manage stock notifications"
  ON public.stock_notifications FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_stock_notif_product
  ON public.stock_notifications(product_id)
  WHERE notified_at IS NULL;