
-- Fix: Make view use SECURITY INVOKER (default but explicit)
CREATE OR REPLACE VIEW public.public_fiber_batches
WITH (security_invoker = true)
AS
  SELECT
    batch_code, farm_name, region, shearing_date, fiber_grade,
    micron_measurement, weight_kg, processing_date, product_type,
    manufacturing_date, status, created_at
  FROM public.fiber_batches;

-- The view with SECURITY INVOKER needs the querying user to have SELECT on the base table.
-- Add a limited public read policy so the view works for anonymous/authenticated users.
CREATE POLICY "Public can read batches for traceability view"
  ON public.fiber_batches FOR SELECT
  TO anon, authenticated
  USING (true);
