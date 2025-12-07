-- Restore logo_url column to tenants table
-- It was accidentally removed in migration 012

ALTER TABLE public.tenants
ADD COLUMN IF NOT EXISTS logo_url text;
