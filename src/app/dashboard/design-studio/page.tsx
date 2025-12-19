'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { FooterData, FooterLocation, FooterSocial } from '@/types/menu';
import toast from 'react-hot-toast';
import { Loader2, Save } from 'lucide-react';

import BrandingDesignLab from '@/components/onboarding/BrandingDesignLab';
import { ThemeProvider } from '@/components/theme/ThemeContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tenantId, setTenantId] = useState('');

  const [formData, setFormData] = useState({
    restaurantName: '',
    slug: '',
    // Legacy colors kept for compatibility but managed via themeOptions now
    primaryColor: '#8B0000',
    secondaryColor: '#D4AF37',
    backgroundColor: '#FFF8E7',
    surfaceColor: '#FFFFFF',
    textColor: '#171717',
    secondaryTextColor: '#4B5563',
    footerData: {
      locations: [] as FooterLocation[],
      socials: [] as FooterSocial[],
      show_brand_column: true,
    } as FooterData,
    logoUrl: '',
    heroTitleColor: '#FFFFFF',
    heroTaglineColor: '#E5E7EB',
    themeOptions: null as Record<string, unknown> | null,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: tenant, error } = await (supabase.from('tenants') as any)
        .select('*, tenant_locations(*)')
        .eq('owner_id', user.id)
        .single();

      if (error || !tenant) return;

      // Fetch design settings
      let themeOptions = null;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: designData } = await (supabase.from('tenant_design_settings') as any)
        .select('theme_config')
        .eq('tenant_id', tenant.id)
        .single();

      if (designData) {
        themeOptions = designData.theme_config;
      }

      setTenantId(tenant.id);

      // Map tenant_locations to FooterLocation format for UI
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const dbLocations = tenant.tenant_locations || [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const uiLocations: FooterLocation[] = dbLocations.map((l: any) => ({
        city: l.city,
        address: l.address,
        phone: l.phone || '',
        opening_hours: l.opening_hours || ''
      }));

      setFormData({
        restaurantName: tenant.restaurant_name || '',
        slug: tenant.slug || '',
        primaryColor: tenant.primary_color || '#8B0000',
        secondaryColor: tenant.secondary_color || '#D4AF37',
        backgroundColor: tenant.background_color || '#FFF8E7',
        surfaceColor: tenant.surface_color || '#FFFFFF',
        textColor: tenant.text_color || '#171717',
        secondaryTextColor: tenant.secondary_text_color || '#4B5563',
        footerData: {
          ...(tenant.footer_data || {
            socials: [],
            show_brand_column: true,
          }),
          locations: uiLocations,
        },
        logoUrl: tenant.logo_url || '',
        heroTitleColor: tenant.hero_title_color || '#FFFFFF',
        heroTaglineColor: tenant.hero_tagline_color || '#E5E7EB',
        themeOptions: themeOptions,
      });
    } catch (err) {
      console.error('Error loading settings:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setSaving(true);
    const supabase = createClient();

    try {
      // 1. Update Tenant Info (Logo Only)
      const { error: tenantError } = await (supabase.from('tenants') as any)
        .update({
          logo_url: formData.logoUrl,
        })
        .eq('id', tenantId);

      if (tenantError) {
        throw new Error(`Tenant Update Error: ${tenantError.message || JSON.stringify(tenantError)}`);
      }

      // 2. Update Design Settings
      if (formData.themeOptions) {
        const { error: designError } = await (supabase.from('tenant_design_settings') as any)
          .upsert({
            tenant_id: tenantId,
            theme_config: formData.themeOptions
          });

        if (designError) {
          throw new Error(`Design Settings Error: ${designError.message || JSON.stringify(designError)}`);
        }
      }

      toast.success('Impostazioni salvate con successo!');
    } catch (err: any) {
      console.error('Full Error saving settings:', err);
      let message = 'Errore durante il salvataggio.';
      if (err instanceof Error) message = err.message;
      else if (typeof err === 'object') message = JSON.stringify(err);

      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4 md:p-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-gray-900 mb-2">
          Design Studio 🎨
        </h1>
        <p className="text-muted-foreground">
          Personalizza il design e le impostazioni del tuo ristorante
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">

        {/* Design Lab */}
        <Card className="overflow-hidden border-orange-100 shadow-md">
          {/* No Header needed as per previous cleanup */}
          <CardContent className="p-0">
            <div className="h-[calc(100vh-140px)] min-h-[600px]">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <ThemeProvider initialTheme={(formData.themeOptions || undefined) as any}>
                <BrandingDesignLab
                  formData={{
                    restaurant_name: formData.restaurantName,
                    slug: formData.slug,
                    logo_url: formData.logoUrl,
                    primary_color: formData.primaryColor,
                    secondary_color: formData.secondaryColor,
                    background_color: formData.backgroundColor,
                    hero_title_color: formData.heroTitleColor,
                    hero_tagline_color: formData.heroTaglineColor,
                    footer_data: formData.footerData,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    theme_options: (formData.themeOptions || undefined) as any
                  }}
                  onUpdate={(updates) => {
                    setFormData(prev => {
                      const newData = { ...prev };
                      if (updates.theme_options) newData.themeOptions = updates.theme_options;
                      if (updates.logo_url) newData.logoUrl = updates.logo_url;
                      if (updates.theme_options && updates.theme_options.colors) {
                        const c = updates.theme_options.colors;
                        if (c.primary) newData.primaryColor = c.primary;
                        if (c.secondary) newData.secondaryColor = c.secondary;
                        if (c.background) newData.backgroundColor = c.background;
                        if (c.surface) newData.surfaceColor = c.surface;
                        if (c.text) newData.textColor = c.text;
                      }
                      return newData;
                    });
                  }}
                  onNext={() => {
                    toast.success('Design aggiornato! Ricordati di salvare le impostazioni generali in fondo alla pagina.', { duration: 5000 });
                  }}
                  onBack={() => { }}
                  hideNavigation={true}
                  tenantId={tenantId}
                />
              </ThemeProvider>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-sm border-t border-gray-200 z-40 md:static md:bg-transparent md:border-0 md:p-0 md:pt-4 md:flex md:justify-end">
          <Button
            type="submit"
            disabled={saving}
            size="lg"
            className="w-full md:w-auto bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg hover:shadow-xl transition-all"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Salvataggio...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Salva Modifiche
              </>
            )}
          </Button>
        </div>
        {/* Spacer for mobile sticky button */}
        <div className="h-20 md:hidden"></div>
      </form>
    </div>
  );
}
