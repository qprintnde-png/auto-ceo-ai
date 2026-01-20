-- Create cached_sections table for AI response caching
CREATE TABLE public.cached_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  input_hash TEXT UNIQUE NOT NULL,
  section_type TEXT NOT NULL,
  ai_provider TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '7 days'),
  hit_count INTEGER DEFAULT 0
);

-- Create indexes for efficient lookups
CREATE INDEX idx_cached_sections_hash ON public.cached_sections(input_hash);
CREATE INDEX idx_cached_sections_expires ON public.cached_sections(expires_at);
CREATE INDEX idx_cached_sections_section_type ON public.cached_sections(section_type);

-- Enable RLS
ALTER TABLE public.cached_sections ENABLE ROW LEVEL SECURITY;

-- Cache is system-managed, only service role can access
CREATE POLICY "Service role can manage cache"
ON public.cached_sections
FOR ALL
USING (true)
WITH CHECK (true);

-- Function to clean up expired cache entries (can be called via cron)
CREATE OR REPLACE FUNCTION public.cleanup_expired_cache()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.cached_sections WHERE expires_at < now();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;