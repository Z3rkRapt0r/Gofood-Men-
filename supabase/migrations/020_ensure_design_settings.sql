-- 1. Create table if not exists
CREATE TABLE IF NOT EXISTS public.tenant_design_settings (
  tenant_id UUID PRIMARY KEY REFERENCES public.tenants(id) ON DELETE CASCADE,
  theme_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.tenant_design_settings IS 'Dedicated storage for branding and design studio configurations';

-- 2. Enable RLS
ALTER TABLE public.tenant_design_settings ENABLE ROW LEVEL SECURITY;

-- 3. Safely recreate policies (Drop then Create)
DROP POLICY IF EXISTS "Users can view their own tenant design settings" ON public.tenant_design_settings;
CREATE POLICY "Users can view their own tenant design settings"
  ON public.tenant_design_settings
  FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT id FROM public.tenants WHERE owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert their own tenant design settings" ON public.tenant_design_settings;
CREATE POLICY "Users can insert their own tenant design settings"
  ON public.tenant_design_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    tenant_id IN (
      SELECT id FROM public.tenants WHERE owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update their own tenant design settings" ON public.tenant_design_settings;
CREATE POLICY "Users can update their own tenant design settings"
  ON public.tenant_design_settings
  FOR UPDATE
  TO authenticated
  USING (
    tenant_id IN (
      SELECT id FROM public.tenants WHERE owner_id = auth.uid()
    )
  );
  
-- 4. Public access for public menu (SELECT only)
-- We forgot this in 015, but it is needed for GET /api/tenant or GET /[slug] which uses anon key?
-- Actually, the server components usually use service_role so they bypass RLS.
-- But client components fetching via browser might need anon access.
-- Let's check permissions.
GRANT ALL ON public.tenant_design_settings TO authenticated;
GRANT ALL ON public.tenant_design_settings TO service_role;
GRANT SELECT ON public.tenant_design_settings TO anon;

-- Add a policy for Anon access (Read-only by tenant slug? No, ID)
-- This is tricky, anon doesn't know owner_id.
-- Usually, we lookup by tenant_id. 
-- Let's simply allow Anon SELECT for now properly constrained?
-- Actually, if we expose this table to anon, anyone can dump all designs if we are not careful?
-- But we usually filter by tenant_id anyway.
-- Let's keep it restricted for now, assuming public pages use `supabase-admin` or `createClient` with service role logic OR the tenant context.
-- Wait, `src/app/[slug]/page.tsx` uses `createClient` from `@/lib/supabase/server` which uses cookies? No, `getTenantData`?
-- Let's double check anon access.
-- If the public page fetches it, it needs anon access.
-- `src/app/[slug]/allergeni/page.tsx` calls `getTenantData`.
-- `getTenantData` uses `createClient()`.
-- If the user is unauthenticated (public visitor), `createClient()` uses anon key.
-- So we MUST have a policy for ANON SELECT.

DROP POLICY IF EXISTS "Public can view tenant design settings" ON public.tenant_design_settings;
CREATE POLICY "Public can view tenant design settings"
  ON public.tenant_design_settings
  FOR SELECT
  TO anon
  USING (true); -- Or verify tenant is public? Tenants table usually handles visibility. 
  -- For now allow SELECT true, as design settings aren't super sensitive (colors).
