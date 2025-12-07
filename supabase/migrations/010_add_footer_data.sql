-- Add footer_data column to tenants table
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS footer_data JSONB;

-- Comment on column
COMMENT ON COLUMN tenants.footer_data IS 'Stores footer configuration including locations, links, and socials';
