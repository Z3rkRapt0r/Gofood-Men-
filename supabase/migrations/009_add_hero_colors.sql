-- Add hero colors to tenants table
ALTER TABLE public.tenants
ADD COLUMN IF NOT EXISTS hero_title_color text DEFAULT '#FFFFFF',
ADD COLUMN IF NOT EXISTS hero_tagline_color text DEFAULT '#E5E7EB';
