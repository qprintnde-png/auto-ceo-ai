-- Fix cached_sections RLS: restrict to service_role only
DROP POLICY IF EXISTS "Service role can manage cache" ON public.cached_sections;

CREATE POLICY "Service role can manage cache"
ON public.cached_sections
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Also add a read policy for authenticated users (they should be able to read cache)
CREATE POLICY "Authenticated users can read cache"
ON public.cached_sections
FOR SELECT
TO authenticated
USING (true);