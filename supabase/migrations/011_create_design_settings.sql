-- Create tenant_design_settings table
CREATE TABLE IF NOT EXISTS public.tenant_design_settings (
  tenant_id UUID PRIMARY KEY REFERENCES public.tenants(id) ON DELETE CASCADE,
  theme_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.tenant_design_settings IS 'Dedicated storage for branding and design studio configurations';

-- Trigger for updated_at
CREATE TRIGGER update_tenant_design_settings_updated_at
  BEFORE UPDATE ON public.tenant_design_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Migration Logic: Populate tenant_design_settings from existing tenants data
-- We attempt to construct a valid ThemeConfig JSON from the old columns if theme_options is missing
INSERT INTO public.tenant_design_settings (tenant_id, theme_config)
SELECT 
  id as tenant_id,
  COALESCE(
    theme_options, -- Use existing JSON if available (from our recent work)
    jsonb_build_object( -- Fallback: Construct JSON from legacy columns
      'id', 'custom-migration',
      'name', 'Legacy Migration',
      'colors', jsonb_build_object(
        'primary', COALESCE(primary_color, '#8B0000'),
        'secondary', COALESCE(secondary_color, '#D4AF37'),
        'background', COALESCE(background_color, '#FFF8E7'),
        'surface', '#FFFFFF',
        'text', '#000000',
        'textSecondary', '#4B5563',
        'accent', COALESCE(primary_color, '#8B0000'),
        'border', COALESCE(secondary_color, '#D4AF37'),
        'price', '#000000',
        'success', '#10B981'
      ),
      'frame', 'simple',
      'texture', 'none',
      'pattern', 'none',
      'fontHeading', 'Inter',
      'fontBody', 'Inter',
      'scale', 1,
      'rounded', 'md',
      'shadows', 'soft',
      'dividerStyle', 'solid'
    )
  ) as theme_config
FROM public.tenants
ON CONFLICT (tenant_id) DO NOTHING;
