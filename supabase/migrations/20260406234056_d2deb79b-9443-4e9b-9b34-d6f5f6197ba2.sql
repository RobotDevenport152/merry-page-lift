ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS tracking_number TEXT,
  ADD COLUMN IF NOT EXISTS carrier TEXT;

ALTER TABLE public.order_items
  ADD COLUMN IF NOT EXISTS batch_code TEXT;