-- Add theme_options column to tenants table to store advanced visual settings
ALTER TABLE public.tenants 
ADD COLUMN IF NOT EXISTS theme_options JSONB DEFAULT '{}'::jsonb;

-- Comment on column
COMMENT ON COLUMN public.tenants.theme_options IS 'Stores advanced theme configuration (fonts, frames, textures, patterns) from the Design Lab';
