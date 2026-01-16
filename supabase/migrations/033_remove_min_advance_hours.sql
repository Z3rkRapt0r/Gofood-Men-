-- Migration 033: Remove min_advance_hours from reservation_settings
-- This migration drops the min_advance_hours column as the feature has been removed.

ALTER TABLE public.reservation_settings
DROP COLUMN IF EXISTS min_advance_hours;
