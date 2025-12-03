-- Add tagline column to tenants table
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS tagline TEXT;
