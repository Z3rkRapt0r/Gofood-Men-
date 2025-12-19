'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { FooterData, FooterLocation, FooterLink, FooterSocial } from '@/types/menu';
import toast from 'react-hot-toast';


import BrandingDesignLab from '@/components/onboarding/BrandingDesignLab';
import { ThemeProvider } from '@/components/theme/ThemeContext';

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





  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
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
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-gray-900 mb-2">
          Design Studio 🎨
        </h1>
        <p className="text-gray-600">
          Personalizza il design e le impostazioni del tuo ristorante
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">


        {/* Design Lab */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              Design & Branding 🎨
            </h2>
            <p className="text-gray-500 text-sm">Personalizza l&apos;aspetto del tuo menu con il nuovo editor visivo</p>
          </div>

          <div className="h-[calc(100vh-140px)] min-h-[600px]">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <ThemeProvider initialTheme={(formData.themeOptions || undefined) as any}>
              <BrandingDesignLab
                formData={{
                  // These are now handled in the Design Lab itself or ignored if not set here.
                  // Since we removed them from local state, we should pass empty strings or partial data if needed by the component.
                  // Ideally BrandingDesignLab should fetch its own data or accept what we have.
                  // For now, let's pass dummy/empty values if the type requires them, or just what we have.
                  // If BrandingDesignLab relies on these for live preview, we might need to fetch them but not expose in form.
                  // However, for this refactor, we assume DesignLab primarily cares about colors/logo, and maybe name/slug for preview context. 
                  // If we don't have them in state, we can't pass them easily without fetching them separately or keeping them in state but hidden.
                  // DECISION: BrandingDesignLab preview uses these. We must keep them in state OR fetch them just for the preview.
                  // Given the user instruction "spostali", removing entirely from UI is done. Removing from code might break preview.
                  // LET'S CHECK: The user said "spostali" (move them).
                  // If I remove them from state, BrandingDesignLab gets empty strings.
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
                  // Update local state based on what changed
                  setFormData(prev => {
                    const newData = { ...prev };
                    if (updates.theme_options) newData.themeOptions = updates.theme_options;
                    if (updates.logo_url) newData.logoUrl = updates.logo_url;
                    // Sync legacy colors if changed (optional, but good for consistency)
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
                  // User clicked "Salva e Continua" in the lab.
                  // We can treat this as a "Save" for the whole settings page, or just alert.
                  // Since we are in a form, maybe we don't auto-submit.
                  toast.success('Design aggiornato! Ricordati di salvare le impostazioni generali in fondo alla pagina.', { duration: 5000 });
                }}
                onBack={() => { }}
                hideNavigation={true}
                tenantId={tenantId}
              />
            </ThemeProvider>
          </div>
        </div>

        {/* Footer Customization */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Personalizzazione Footer
          </h2>

          <div className="space-y-8">
            {/* Brand Description */}
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="mb-4">
                <h3 className="text-sm font-bold text-gray-900 mb-2">Descrizione Brand</h3>
                <p className="text-xs text-gray-500">
                  Questa descrizione apparirà nel footer sotto il logo.
                </p>
              </div>
              <div>
                <textarea
                  value={formData.footerData.brand_description?.it || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    footerData: {
                      ...formData.footerData,
                      brand_description: {
                        ...formData.footerData.brand_description,
                        it: e.target.value,
                        // Sync English to match Italian (or keep empty/legacy) to avoid holes, 
                        // but effectively we ignore it in UI now.
                        en: e.target.value
                      }
                    }
                  })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md h-24 resize-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Scopri i nostri piatti e le nostre specialità..."
                />
              </div>
            </div>

            {/* Locations */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-900">Sedi</h3>
                <button
                  type="button"
                  onClick={() => setFormData({
                    ...formData,
                    footerData: {
                      ...formData.footerData,
                      locations: [...formData.footerData.locations, { city: '', address: '', phone: '', opening_hours: '' }]
                    }
                  })}
                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg font-medium transition-colors"
                >
                  + Aggiungi Sede
                </button>
              </div>
              <div className="space-y-3">
                {formData.footerData.locations.map((loc, index) => (
                  <div key={index} className="flex gap-3 items-start bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        placeholder="Città"
                        value={loc.city}
                        onChange={(e) => {
                          const newLocs = [...formData.footerData.locations];
                          newLocs[index].city = e.target.value;
                          setFormData({ ...formData, footerData: { ...formData.footerData, locations: newLocs } });
                        }}
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md"
                      />
                      <input
                        type="text"
                        placeholder="Indirizzo"
                        value={loc.address}
                        onChange={(e) => {
                          const newLocs = [...formData.footerData.locations];
                          newLocs[index].address = e.target.value;
                          setFormData({ ...formData, footerData: { ...formData.footerData, locations: newLocs } });
                        }}
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md"
                      />
                      <input
                        type="text"
                        placeholder="Telefono (opzionale)"
                        value={loc.phone || ''}
                        onChange={(e) => {
                          const newLocs = [...formData.footerData.locations];
                          newLocs[index].phone = e.target.value;
                          setFormData({ ...formData, footerData: { ...formData.footerData, locations: newLocs } });
                        }}
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md"
                      />
                      <input
                        type="text"
                        placeholder="Orari (es. Lun-Dom: 12-23)"
                        value={loc.opening_hours || ''}
                        onChange={(e) => {
                          const newLocs = [...formData.footerData.locations];
                          newLocs[index].opening_hours = e.target.value;
                          setFormData({ ...formData, footerData: { ...formData.footerData, locations: newLocs } });
                        }}
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newLocs = formData.footerData.locations.filter((_, i) => i !== index);
                        setFormData({ ...formData, footerData: { ...formData.footerData, locations: newLocs } });
                      }}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
                {formData.footerData.locations.length === 0 && (
                  <p className="text-sm text-gray-500 italic">Nessuna sede aggiunta.</p>
                )}
              </div>
            </div>

            {/* Links Section Removed */}


            {/* Socials */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-900">Social Network</h3>
                <button
                  type="button"
                  onClick={() => setFormData({
                    ...formData,
                    footerData: {
                      ...formData.footerData,
                      socials: [...formData.footerData.socials, { platform: 'other', url: '' }]
                    }
                  })}
                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg font-medium transition-colors"
                >
                  + Aggiungi Social
                </button>
              </div>
              <div className="space-y-3">
                {formData.footerData.socials.map((social, index) => (
                  <div key={index} className="flex gap-3 items-start bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <div className="flex-1 space-y-2">
                      <select
                        value={social.platform}
                        onChange={(e) => {
                          const newSocials = [...formData.footerData.socials];
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          newSocials[index].platform = e.target.value as any;
                          setFormData({ ...formData, footerData: { ...formData.footerData, socials: newSocials } });
                        }}
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md"
                      >
                        <option value="facebook">Facebook</option>
                        <option value="instagram">Instagram</option>
                        <option value="tripadvisor">TripAdvisor</option>
                        <option value="website">Sito Web</option>
                        <option value="other">Altro</option>
                      </select>
                      <input
                        type="text"
                        placeholder="URL Profilo"
                        value={social.url}
                        onChange={(e) => {
                          const newSocials = [...formData.footerData.socials];
                          newSocials[index].url = e.target.value;
                          setFormData({ ...formData, footerData: { ...formData.footerData, socials: newSocials } });
                        }}
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newSocials = formData.footerData.socials.filter((_, i) => i !== index);
                        setFormData({ ...formData, footerData: { ...formData.footerData, socials: newSocials } });
                      }}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
                {formData.footerData.socials.length === 0 && (
                  <p className="text-sm text-gray-500 italic">Nessun social aggiunto.</p>
                )}
              </div>
            </div>
          </div>
        </div>




        {/* Save Button */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Salvataggio...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Salva Modifiche</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
