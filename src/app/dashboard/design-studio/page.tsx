'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { FooterData, FooterLocation, FooterSocial } from '@/types/menu';
import toast from 'react-hot-toast';
import { Loader2, Plus, Trash2, Save } from 'lucide-react';

import BrandingDesignLab from '@/components/onboarding/BrandingDesignLab';
import { ThemeProvider } from '@/components/theme/ThemeContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
          footer_data: {
            ...formData.footerData,
            locations: []
          }
        })
        .eq('id', tenantId);

      if (tenantError) {
        throw new Error(`Tenant Update Error: ${tenantError.message || JSON.stringify(tenantError)}`);
      }

      // 2. Update Locations
      // Delete old
      const { error: deleteError } = await (supabase.from('tenant_locations') as any)
        .delete()
        .eq('tenant_id', tenantId);

      if (deleteError) {
        throw new Error(`Locations Delete Error: ${deleteError.message || JSON.stringify(deleteError)}`);
      }

      // Insert new
      const locationsToInsert = formData.footerData.locations.map((loc, idx) => ({
        tenant_id: tenantId,
        city: loc.city,
        address: loc.address,
        phone: loc.phone || null,
        opening_hours: loc.opening_hours || null,
        is_primary: idx === 0
      }));

      if (locationsToInsert.length > 0) {
        const { error: insertError } = await (supabase.from('tenant_locations') as any)
          .insert(locationsToInsert);

        if (insertError) {
          throw new Error(`Locations Insert Error: ${insertError.message || JSON.stringify(insertError)}`);
        }
      }

      // 3. Update Design Settings
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

        {/* Footer Customization */}
        <Card>
          <CardHeader>
            <CardTitle>Personalizzazione Footer</CardTitle>
            <CardDescription>Gestisci le informazioni visualizzate nel footer del tuo menu digitale.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">

            {/* Brand Description */}
            <div className="space-y-2">
              <Label htmlFor="brand-desc">Descrizione Brand</Label>
              <p className="text-xs text-muted-foreground">
                Questa descrizione apparirà nel footer sotto il logo.
              </p>
              <Textarea
                id="brand-desc"
                value={formData.footerData.brand_description?.it || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  footerData: {
                    ...formData.footerData,
                    brand_description: {
                      ...formData.footerData.brand_description,
                      it: e.target.value,
                      en: e.target.value
                    }
                  }
                })}
                placeholder="Scopri i nostri piatti e le nostre specialità..."
                className="resize-none h-24"
              />
            </div>

            {/* Locations */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base">Sedi</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFormData({
                    ...formData,
                    footerData: {
                      ...formData.footerData,
                      locations: [...formData.footerData.locations, { city: '', address: '', phone: '', opening_hours: '' }]
                    }
                  })}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" /> Aggiungi Sede
                </Button>
              </div>

              <div className="space-y-3">
                {formData.footerData.locations.map((loc, index) => (
                  <Card key={index} className="bg-muted/30">
                    <CardContent className="p-4 flex gap-3 items-start">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1">
                        <Input
                          placeholder="Città"
                          value={loc.city}
                          onChange={(e) => {
                            const newLocs = [...formData.footerData.locations];
                            newLocs[index].city = e.target.value;
                            setFormData({ ...formData, footerData: { ...formData.footerData, locations: newLocs } });
                          }}
                        />
                        <Input
                          placeholder="Indirizzo"
                          value={loc.address}
                          onChange={(e) => {
                            const newLocs = [...formData.footerData.locations];
                            newLocs[index].address = e.target.value;
                            setFormData({ ...formData, footerData: { ...formData.footerData, locations: newLocs } });
                          }}
                        />
                        <Input
                          placeholder="Telefono (opzionale)"
                          value={loc.phone || ''}
                          onChange={(e) => {
                            const newLocs = [...formData.footerData.locations];
                            newLocs[index].phone = e.target.value;
                            setFormData({ ...formData, footerData: { ...formData.footerData, locations: newLocs } });
                          }}
                        />
                        <Input
                          placeholder="Orari (es. Lun-Dom: 12-23)"
                          value={loc.opening_hours || ''}
                          onChange={(e) => {
                            const newLocs = [...formData.footerData.locations];
                            newLocs[index].opening_hours = e.target.value;
                            setFormData({ ...formData, footerData: { ...formData.footerData, locations: newLocs } });
                          }}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const newLocs = formData.footerData.locations.filter((_, i) => i !== index);
                          setFormData({ ...formData, footerData: { ...formData.footerData, locations: newLocs } });
                        }}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
                {formData.footerData.locations.length === 0 && (
                  <p className="text-sm text-muted-foreground italic text-center py-4 border border-dashed rounded-lg">
                    Nessuna sede aggiunta.
                  </p>
                )}
              </div>
            </div>

            {/* Socials */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base">Social Network</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFormData({
                    ...formData,
                    footerData: {
                      ...formData.footerData,
                      socials: [...formData.footerData.socials, { platform: 'other', url: '' }]
                    }
                  })}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" /> Aggiungi Social
                </Button>
              </div>

              <div className="space-y-3">
                {formData.footerData.socials.map((social, index) => (
                  <div key={index} className="flex gap-3 items-start">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-1">
                      <Select
                        value={social.platform}
                        onValueChange={(value) => {
                          const newSocials = [...formData.footerData.socials];
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          newSocials[index].platform = value as any;
                          setFormData({ ...formData, footerData: { ...formData.footerData, socials: newSocials } });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Social" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="facebook">Facebook</SelectItem>
                          <SelectItem value="instagram">Instagram</SelectItem>
                          <SelectItem value="tripadvisor">TripAdvisor</SelectItem>
                          <SelectItem value="website">Sito Web</SelectItem>
                          <SelectItem value="other">Altro</SelectItem>
                        </SelectContent>
                      </Select>

                      <Input
                        className="md:col-span-2"
                        placeholder="URL Profilo"
                        value={social.url}
                        onChange={(e) => {
                          const newSocials = [...formData.footerData.socials];
                          newSocials[index].url = e.target.value;
                          setFormData({ ...formData, footerData: { ...formData.footerData, socials: newSocials } });
                        }}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const newSocials = formData.footerData.socials.filter((_, i) => i !== index);
                        setFormData({ ...formData, footerData: { ...formData.footerData, socials: newSocials } });
                      }}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {formData.footerData.socials.length === 0 && (
                  <p className="text-sm text-muted-foreground italic text-center py-4 border border-dashed rounded-lg">
                    Nessun social aggiunto.
                  </p>
                )}
              </div>
            </div>

          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
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
      </form>
    </div>
  );
}
