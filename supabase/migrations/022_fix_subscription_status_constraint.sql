-- Drop the existing check constraint
ALTER TABLE tenants DROP CONSTRAINT IF EXISTS tenants_subscription_status_check;

-- Add the new check constraint including 'trialing'
ALTER TABLE tenants 
ADD CONSTRAINT tenants_subscription_status_check 
CHECK (subscription_status IN ('trialing', 'active', 'suspended', 'cancelled', 'past_due', 'incomplete'));
