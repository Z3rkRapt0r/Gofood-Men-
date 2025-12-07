-- Remove remaining legacy style columns from tenants table
-- These were identified in the cleanup analysis as being superseded by tenant_design_settings

ALTER TABLE public.tenants
DROP COLUMN IF EXISTS surface_color,
DROP COLUMN IF EXISTS text_color,
DROP COLUMN IF EXISTS secondary_text_color;

-- Note: 'tagline' and 'logo_url' are kept as they are considered part of the core business identity/content
-- rather than purely "design/theme" configuration.
