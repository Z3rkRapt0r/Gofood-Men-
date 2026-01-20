-- Migration 035: Remove notification_email and unused columns from reservation_settings
-- Since we now use the tenant's primary contact email for notifications, 
-- the redundant column can be safely removed.

ALTER TABLE public.reservation_settings
DROP COLUMN IF EXISTS notification_email;
