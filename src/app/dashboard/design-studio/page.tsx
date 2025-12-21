'use client';

import { useEffect, useState } from 'react';
import { FooterData, FooterLocation, FooterSocial } from '@/types/menu';
import toast from 'react-hot-toast';
import { Loader2, Save } from 'lucide-react';

import BrandingDesignLab from '@/components/onboarding/BrandingDesignLab';
import { ThemeProvider } from '@/components/theme/ThemeContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useTenant, useUpdateTenant } from '@/hooks/useTenant';

export default function SettingsPage() {
  const { data: tenant, isLoading } = useTenant();
  const { mutateAsync: updateTenant, isPending: isSaving } = useUpdateTenant();

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

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const [loadedTheme, setLoadedTheme] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    if (tenant) {
      const themeOptions = tenant.theme_options || null;
      setLoadedTheme(themeOptions);

      // useTenant already processes footer_data to include locations from the DB
      const processedFooterData = tenant.footer_data || {
        socials: [],
        show_brand_column: true,
        locations: []
      };

      setFormData({
        restaurantName: tenant.restaurant_name || '',
        slug: tenant.slug || '',
        primaryColor: tenant.primary_color || '#8B0000',
        secondaryColor: tenant.secondary_color || '#D4AF37',
        backgroundColor: tenant.background_color || '#FFF8E7',
        surfaceColor: tenant.surface_color || '#FFFFFF',
        textColor: tenant.text_color || '#171717',
        secondaryTextColor: tenant.secondary_text_color || '#4B5563',
        footerData: processedFooterData,
        logoUrl: tenant.logo_url || '',
        heroTitleColor: tenant.hero_title_color || '#FFFFFF',
        heroTaglineColor: tenant.hero_tagline_color || '#E5E7EB',
        themeOptions: themeOptions,
      });
    }
  }, [tenant]);

  async function handleSave(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!tenant) return;

    try {
      await updateTenant({
        id: tenant.id,
        updates: {
          logo_url: formData.logoUrl,
          footer_data: formData.footerData,
          theme_options: formData.themeOptions
        }
      });
      // Success toast is handled by the hook
    } catch (err: any) {
      console.error('Error saving settings:', err);
      // Error toast is handled by the hook
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  if (!tenant) return null;

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
        <Card className="border-orange-100 shadow-md md:overflow-hidden">
          {/* No Header needed as per previous cleanup */}
          <CardContent className="p-0">
            <div className="h-auto min-h-[600px] md:h-[calc(100vh-140px)]">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <ThemeProvider initialTheme={(loadedTheme || undefined) as any}>
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
                      if (updates.footer_data) newData.footerData = updates.footer_data;
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
                  tenantId={tenant.id}
                  footerSlot={
                    <Button
                      type="submit"
                      disabled={isSaving}
                      size="lg"
                      className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg hover:shadow-xl transition-all"
                    >
                      {isSaving ? (
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
                  }
                />
              </ThemeProvider>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
