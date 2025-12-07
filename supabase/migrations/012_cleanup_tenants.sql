-- Remove legacy columns from tenants table
-- CAUTION: This deletes data. Ensure migration 011 has run successfully.

ALTER TABLE public.tenants
DROP COLUMN IF EXISTS primary_color,
DROP COLUMN IF EXISTS secondary_color,
DROP COLUMN IF EXISTS background_color,
DROP COLUMN IF EXISTS hero_title_color,
DROP COLUMN IF EXISTS hero_tagline_color,
DROP COLUMN IF EXISTS theme_options,
DROP COLUMN IF EXISTS logo_url; -- Wait, logo_url might still be useful on root? 
-- Actually, the user asked to remove "old tables/columns regarding personalization". 
-- logo_url is often considered core identity, but for a "Design Studio" it might belong in the design settings.
-- For now, I will KEEP logo_url in tenants as it's used for more than just styling (e.g. email headers, dashboard lists).
-- If the user wants it moved, we can do that, but "personalization" usually refers to colors/fonts.
-- The user explicitly mentioned "customization" tables.
-- Let's drop the colors and theme_options. Keeping logo_url and slug/name as business identity.

-- Dropping the columns explicitly listed in the plan
ALTER TABLE public.tenants
DROP COLUMN IF EXISTS primary_color,
DROP COLUMN IF EXISTS secondary_color,
DROP COLUMN IF EXISTS background_color,
DROP COLUMN IF EXISTS hero_title_color,
DROP COLUMN IF EXISTS hero_tagline_color,
DROP COLUMN IF EXISTS theme_options;
