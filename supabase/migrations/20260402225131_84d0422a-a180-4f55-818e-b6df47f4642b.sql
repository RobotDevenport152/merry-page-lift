-- Drop overly permissive policies
DROP POLICY IF EXISTS "Anyone can submit contact" ON public.contact_enquiries;
DROP POLICY IF EXISTS "Anyone can submit wholesale" ON public.wholesale_enquiries;

-- Recreate with authenticated check (allow both anon and authenticated via Supabase anon key)
CREATE POLICY "Authenticated users can submit contact" ON public.contact_enquiries 
  FOR INSERT TO authenticated, anon
  WITH CHECK (length(email) > 0 AND length(name) > 0 AND length(message) > 0);

CREATE POLICY "Authenticated users can submit wholesale" ON public.wholesale_enquiries 
  FOR INSERT TO authenticated, anon
  WITH CHECK (length(email) > 0 AND length(company_name) > 0 AND length(contact_name) > 0);