-- Add trial fields to tenants table
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'trialing';

-- Update existing tenants to be on trial (optional, but good for consistency/dev)
UPDATE tenants 
SET trial_ends_at = NOW() + INTERVAL '7 days',
    subscription_status = 'trialing'
WHERE trial_ends_at IS NULL;
