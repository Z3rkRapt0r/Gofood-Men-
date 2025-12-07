-- Enable RLS on tenant_design_settings
ALTER TABLE public.tenant_design_settings ENABLE ROW LEVEL SECURITY;

-- Policy for SELECT
CREATE POLICY "Users can view their own tenant design settings"
  ON public.tenant_design_settings
  FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT id FROM public.tenants WHERE owner_id = auth.uid()
    )
  );

-- Policy for INSERT (allows creating if you own the tenant)
CREATE POLICY "Users can insert their own tenant design settings"
  ON public.tenant_design_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    tenant_id IN (
      SELECT id FROM public.tenants WHERE owner_id = auth.uid()
    )
  );

-- Policy for UPDATE
CREATE POLICY "Users can update their own tenant design settings"
  ON public.tenant_design_settings
  FOR UPDATE
  TO authenticated
  USING (
    tenant_id IN (
      SELECT id FROM public.tenants WHERE owner_id = auth.uid()
    )
  );

-- Grant access to authenticated role
GRANT ALL ON public.tenant_design_settings TO authenticated;
GRANT ALL ON public.tenant_design_settings TO service_role;
