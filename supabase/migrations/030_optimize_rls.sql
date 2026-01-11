-- Migration 030: Optimize RLS Performance
-- Fixes "Auth RLS Initialization Plan" AND "Multiple Permissive Policies" issues.
-- Strategy:
-- 1. Wrap auth.uid() in (SELECT auth.uid()) to avoid re-evaluation (initplan fix).
-- 2. Merge overlapping SELECT policies for 'authenticated' role to avoid multiple policy headers (permissive fix).
-- 3. Restrict "Public read..." policies to 'anon' role only.

-- ============================================================
-- 1. PROFILES
-- ============================================================

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = id);

-- ============================================================
-- 2. TENANTS
-- ============================================================

DROP POLICY IF EXISTS "Authenticated users can create tenants" ON public.tenants;
CREATE POLICY "Authenticated users can create tenants"
  ON public.tenants
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = owner_id);

DROP POLICY IF EXISTS "Owners can update own tenant" ON public.tenants;
CREATE POLICY "Owners can update own tenant"
  ON public.tenants
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = owner_id)
  WITH CHECK ((SELECT auth.uid()) = owner_id);

DROP POLICY IF EXISTS "Owners can delete own tenant" ON public.tenants;
CREATE POLICY "Owners can delete own tenant"
  ON public.tenants
  FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = owner_id);

-- ============================================================
-- 3. CATEGORIES (Fixing Multiple Permissive Policies + InitPlan)
-- ============================================================

-- A. Public read -> Restrict to ANON
DROP POLICY IF EXISTS "Public read access to visible categories" ON public.categories;
CREATE POLICY "Public read access to visible categories"
  ON public.categories
  FOR SELECT
  TO anon
  USING (is_visible = TRUE);

-- B. Authenticated read -> Combine (Visible OR Owner)
DROP POLICY IF EXISTS "Tenant owners can read own categories" ON public.categories;
DROP POLICY IF EXISTS "Authenticated read access to categories" ON public.categories; -- cleanup check
CREATE POLICY "Authenticated read access to categories"
  ON public.categories
  FOR SELECT
  TO authenticated
  USING (
    is_visible = TRUE
    OR
    tenant_id IN (
      SELECT id FROM public.tenants WHERE owner_id = (SELECT auth.uid())
    )
  );

-- C. Write policies (Owner only)
DROP POLICY IF EXISTS "Tenant owners can create categories" ON public.categories;
CREATE POLICY "Tenant owners can create categories"
  ON public.categories
  FOR INSERT
  TO authenticated
  WITH CHECK (
    tenant_id IN (
      SELECT id FROM public.tenants WHERE owner_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Tenant owners can update own categories" ON public.categories;
CREATE POLICY "Tenant owners can update own categories"
  ON public.categories
  FOR UPDATE
  TO authenticated
  USING (
    tenant_id IN (
      SELECT id FROM public.tenants WHERE owner_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    tenant_id IN (
      SELECT id FROM public.tenants WHERE owner_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Tenant owners can delete own categories" ON public.categories;
CREATE POLICY "Tenant owners can delete own categories"
  ON public.categories
  FOR DELETE
  TO authenticated
  USING (
    tenant_id IN (
      SELECT id FROM public.tenants WHERE owner_id = (SELECT auth.uid())
    )
  );

-- ============================================================
-- 4. DISHES (Fixing Multiple Permissive Policies + InitPlan)
-- ============================================================

-- A. Public read -> Restrict to ANON
DROP POLICY IF EXISTS "Public read access to visible dishes" ON public.dishes;
CREATE POLICY "Public read access to visible dishes"
  ON public.dishes
  FOR SELECT
  TO anon
  USING (is_visible = TRUE);

-- B. Authenticated read -> Combine (Visible OR Owner)
DROP POLICY IF EXISTS "Tenant owners can read own dishes" ON public.dishes;
DROP POLICY IF EXISTS "Authenticated read access to dishes" ON public.dishes;
CREATE POLICY "Authenticated read access to dishes"
  ON public.dishes
  FOR SELECT
  TO authenticated
  USING (
    is_visible = TRUE
    OR
    tenant_id IN (
      SELECT id FROM public.tenants WHERE owner_id = (SELECT auth.uid())
    )
  );

-- C. Write policies (Owner only)
DROP POLICY IF EXISTS "Tenant owners can create dishes" ON public.dishes;
CREATE POLICY "Tenant owners can create dishes"
  ON public.dishes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    tenant_id IN (
      SELECT id FROM public.tenants WHERE owner_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Tenant owners can update own dishes" ON public.dishes;
CREATE POLICY "Tenant owners can update own dishes"
  ON public.dishes
  FOR UPDATE
  TO authenticated
  USING (
    tenant_id IN (
      SELECT id FROM public.tenants WHERE owner_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    tenant_id IN (
      SELECT id FROM public.tenants WHERE owner_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Tenant owners can delete own dishes" ON public.dishes;
CREATE POLICY "Tenant owners can delete own dishes"
  ON public.dishes
  FOR DELETE
  TO authenticated
  USING (
    tenant_id IN (
      SELECT id FROM public.tenants WHERE owner_id = (SELECT auth.uid())
    )
  );

-- ============================================================
-- 5. TENANT LOCATIONS (New table)
-- ============================================================

DROP POLICY IF EXISTS "Tenant owners can insert tenant_locations" ON public.tenant_locations;
CREATE POLICY "Tenant owners can insert tenant_locations"
  ON public.tenant_locations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    tenant_id IN (
      SELECT id FROM public.tenants WHERE owner_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Tenant owners can update tenant_locations" ON public.tenant_locations;
CREATE POLICY "Tenant owners can update tenant_locations"
  ON public.tenant_locations
  FOR UPDATE
  TO authenticated
  USING (
    tenant_id IN (
      SELECT id FROM public.tenants WHERE owner_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    tenant_id IN (
      SELECT id FROM public.tenants WHERE owner_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Tenant owners can delete tenant_locations" ON public.tenant_locations;
CREATE POLICY "Tenant owners can delete tenant_locations"
  ON public.tenant_locations
  FOR DELETE
  TO authenticated
  USING (
    tenant_id IN (
      SELECT id FROM public.tenants WHERE owner_id = (SELECT auth.uid())
    )
  );

-- ============================================================
-- 6. TENANT DESIGN SETTINGS (From warning)
-- ============================================================

-- Fix: Drop conflicting "Public can view..." policy from previous migrations
DROP POLICY IF EXISTS "Public can view tenant design settings" ON public.tenant_design_settings;

-- A. Public read -> Restrict to ANON
DROP POLICY IF EXISTS "Public read access to design settings" ON public.tenant_design_settings;
CREATE POLICY "Public read access to design settings"
  ON public.tenant_design_settings
  FOR SELECT
  TO anon
  USING (true);

-- B. Authenticated read -> Combine (Owner OR Public)
DROP POLICY IF EXISTS "Users can view their own tenant design settings" ON public.tenant_design_settings;
CREATE POLICY "Authenticated read access to design settings"
  ON public.tenant_design_settings
  FOR SELECT
  TO authenticated
  USING (
    -- Authenticated users can see settings if they own the tenant OR just viewing publicly
    -- Since these are just colors/fonts, it's safe to let authenticated users view any row
    -- But to be strict/clean:
    tenant_id IN (
      SELECT id FROM public.tenants WHERE owner_id = (SELECT auth.uid())
    )
    OR true -- Actually, design settings are public data (colors/fonts). So 'true' is fine.
            -- BUT if we want to follow the pattern used for dishes:
            -- (tenant_id IN ...)
  );

-- Wait, simply allowing ALL SELECT for everyone for design settings is usually fine, 
-- but to fix the "Multiple Permissive" warning for authenticated users (if we had separate policies),
-- we should just have ONE policy for authenticated.

-- Let's stick to the pattern:
-- 1. Anon can read all.
-- 2. Authenticated can read safely (all).

DROP POLICY IF EXISTS "Authenticated read access to design settings" ON public.tenant_design_settings;
CREATE POLICY "Authenticated read access to design settings"
  ON public.tenant_design_settings
  FOR SELECT
  TO authenticated
  USING (true); 

-- C. Write policies (Owner only)
DROP POLICY IF EXISTS "Users can insert their own tenant design settings" ON public.tenant_design_settings;
CREATE POLICY "Users can insert their own tenant design settings"
  ON public.tenant_design_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    tenant_id IN (
      SELECT id FROM public.tenants WHERE owner_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can update their own tenant design settings" ON public.tenant_design_settings;
CREATE POLICY "Users can update their own tenant design settings"
  ON public.tenant_design_settings
  FOR UPDATE
  TO authenticated
  USING (
    tenant_id IN (
      SELECT id FROM public.tenants WHERE owner_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    tenant_id IN (
      SELECT id FROM public.tenants WHERE owner_id = (SELECT auth.uid())
    )
  );
