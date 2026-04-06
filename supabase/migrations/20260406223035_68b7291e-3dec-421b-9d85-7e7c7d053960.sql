
-- Atomic stock decrement function for stripe-webhook
CREATE OR REPLACE FUNCTION public.decrement_product_stock(
  p_product_id UUID,
  p_quantity INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.products
  SET stock = GREATEST(0, stock - p_quantity),
      updated_at = now()
  WHERE id = p_product_id;
END;
$$;

-- Fix fiber_batches RLS: remove public read, add grower-only access
DROP POLICY IF EXISTS "Batches are viewable by everyone" ON public.fiber_batches;
DROP POLICY IF EXISTS "Admins can manage batches" ON public.fiber_batches;

CREATE POLICY "Growers can view own batches"
  ON public.fiber_batches FOR SELECT
  USING (grower_user_id = auth.uid());

CREATE POLICY "Admins can manage all batches"
  ON public.fiber_batches FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Public traceability view (non-PII fields only)
CREATE OR REPLACE VIEW public.public_fiber_batches AS
  SELECT
    batch_code,
    farm_name,
    region,
    shearing_date,
    fiber_grade,
    micron_measurement,
    weight_kg,
    processing_date,
    product_type,
    manufacturing_date,
    status,
    created_at
  FROM public.fiber_batches;

GRANT SELECT ON public.public_fiber_batches TO anon, authenticated;

-- Order status constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'orders_status_check'
  ) THEN
    ALTER TABLE public.orders
      ADD CONSTRAINT orders_status_check
      CHECK (status IN ('pending', 'paid', 'payment_failed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'));
  END IF;
END $$;
