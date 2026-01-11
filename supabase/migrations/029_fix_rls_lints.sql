-- Migration 029: Fix RLS Lints
-- 1. Fix Security Definer View (Enable security_invoker for menu_with_allergens)
-- This ensures RLS policies of underlying tables are respected for the user invoking the view

ALTER VIEW public.menu_with_allergens SET (security_invoker = true);

-- 2. Fix RLS Disabled on public table (tenant_locations)
-- Enable RLS and add policies

ALTER TABLE IF EXISTS public.tenant_locations ENABLE ROW LEVEL SECURITY;

-- Policy: Public read access
CREATE POLICY "Public read access to tenant_locations"
  ON public.tenant_locations
  FOR SELECT
  USING (true);

-- Policy: Tenant owners can manage their locations
-- Assuming tenant_locations has a tenant_id column
CREATE POLICY "Tenant owners can insert tenant_locations"
  ON public.tenant_locations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    tenant_id IN (
      SELECT id FROM public.tenants WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Tenant owners can update tenant_locations"
  ON public.tenant_locations
  FOR UPDATE
  TO authenticated
  USING (
    tenant_id IN (
      SELECT id FROM public.tenants WHERE owner_id = auth.uid()
    )
  )
  WITH CHECK (
    tenant_id IN (
      SELECT id FROM public.tenants WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Tenant owners can delete tenant_locations"
  ON public.tenant_locations
  FOR DELETE
  TO authenticated
  USING (
    tenant_id IN (
      SELECT id FROM public.tenants WHERE owner_id = auth.uid()
    )
  );

-- 3. Fix Function Search Path Mutable Warnings
-- Set search_path to public to prevent malicious schema usage

-- Fix Function Search Path Mutable Warnings
-- Set search_path to public to prevent malicious schema usage (Safely check if they exist)

DO $$
BEGIN
    -- update_updated_at_column
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
        ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
    END IF;

    -- check_category_tenant_match
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'check_category_tenant_match') THEN
        ALTER FUNCTION public.check_category_tenant_match() SET search_path = public;
    END IF;

    -- populate_dish_allergen_tenant
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'populate_dish_allergen_tenant') THEN
        ALTER FUNCTION public.populate_dish_allergen_tenant() SET search_path = public;
    END IF;

    -- check_dish_limit (Might be dropped in previous migrations)
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'check_dish_limit') THEN
        ALTER FUNCTION public.check_dish_limit() SET search_path = public;
    END IF;

    -- check_category_limit (Might be dropped in previous migrations)
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'check_category_limit') THEN
        ALTER FUNCTION public.check_category_limit() SET search_path = public;
    END IF;
END $$;

-- Fix handle_new_user if it exists (usually from triggers)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user') THEN
        ALTER FUNCTION public.handle_new_user() SET search_path = public;
    END IF;
END $$;
