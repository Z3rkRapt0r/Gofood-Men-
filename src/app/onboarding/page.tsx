'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import type { Tenant } from '@/types/menu';
import StepIndicator from '@/components/onboarding/StepIndicator';
import PlanSelector from '@/components/onboarding/PlanSelector';
import BrandingDesignLab from '@/components/onboarding/BrandingDesignLab';
import { ThemeProvider } from '@/components/theme/ThemeContext';
import FooterConfigurator from '@/components/onboarding/FooterConfigurator';
import { FooterData } from '@/types/menu';

type SubscriptionTier = 'free' | 'basic' | 'premium';

// Define types locally if not imported
interface TenantData {
  restaurant_name: string;
  slug: string | null;
  theme: string;
  primary_color: string;
  secondary_color?: string;
  font: string;
  logo_url?: string;
  footer_data?: any; // Relaxing type to avoid mismatch with FooterData
  subscription_tier?: string;
  contact_email?: string;
  theme_options?: any;
}

// ... (imports remain)
import { Suspense } from 'react';

// ... (type definitions remain)

function OnboardingContent() {
  // ... (original component logic)
  const router = useRouter();
  const searchParams = useSearchParams();
  // ... (rest of logic up to return, using same body)
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [tenant, setTenant] = useState<Tenant | null>(null);

  const [formData, setFormData] = useState<Partial<TenantData>>({
    restaurant_name: '',
    slug: '',
    logo_url: '',
    footer_data: {
      links: [],
      socials: [],
      show_brand_column: true,
      locations: []
    }
  });

  // Load tenant data
  useEffect(() => {
    async function loadTenant() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          router.push('/login');
          return;
        }

        const { data, error } = await supabase
          .from('tenants')
          .select('*, tenant_locations(*)')
          .eq('owner_id', user.id)
          .single();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let tenantData = data as any;

        // Se il tenant non esiste, crealo
        if (error || !data) {
          console.log('Tenant not found, creating initial tenant...');
          const restaurantName = user.user_metadata?.restaurant_name || 'Il Mio Ristorante';
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data: newTenant, error: createError } = await (supabase.from('tenants') as any)
            .insert({
              owner_id: user.id,
              restaurant_name: restaurantName,
              slug: null,
              onboarding_completed: false,
              onboarding_step: 1,
              subscription_tier: 'free',

            })
            .select() // Initial insert probably won't have locations
            .single();

          if (createError) {
            // ... error handling
            return;
          }
          tenantData = newTenant;

          // Initialize empty design settings for new tenant
          if (tenantData) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabase.from('tenant_design_settings') as any).insert({
              tenant_id: tenantData.id,
              theme_config: {}
            });
          }
        }

        // Fetch design settings
        let themeOptions = null;
        if (tenantData) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data: designData } = await (supabase.from('tenant_design_settings') as any)
            .select('theme_config')
            .eq('tenant_id', tenantData.id)
            .single();
          if (designData) {
            themeOptions = designData.theme_config;
          }
        }

        // Se onboarding già completato, vai alla dashboard
        if (tenantData && tenantData.onboarding_completed) {
          router.push('/dashboard');
          return;
        }

        if (!tenantData) return;

        // Map DB locations to UI
        const dbLocations = tenantData.tenant_locations || [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const uiLocations = dbLocations.map((l: any) => ({
          city: l.city,
          address: l.address,
          phone: l.phone || '',
          opening_hours: l.opening_hours || ''
        }));

        const existingFooterData = tenantData.footer_data || { links: [], socials: [], show_brand_column: true };
        const mergedFooterData = {
          ...existingFooterData,
          locations: uiLocations.length > 0 ? uiLocations : (existingFooterData.locations || [])
        };

        setTenant(tenantData);
        setFormData({
          subscription_tier: tenantData.subscription_tier || 'free',
          restaurant_name: tenantData.restaurant_name || '',
          slug: tenantData.slug || '',
          logo_url: tenantData.logo_url || null,
          primary_color: '#8B0000', // Default if needed by local state, but no longer in DB
          secondary_color: '#D4AF37',
          contact_email: tenantData.contact_email || '',
          footer_data: mergedFooterData,
          theme_options: themeOptions
        });
        setCurrentStep(Math.min(tenantData.onboarding_step || 1, 2));
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadTenant();
  }, [router]);

  async function updateTenant(updates: Partial<typeof formData>, nextStep?: number) {
    if (!tenant) return;

    try {
      const supabase = createClient();

      /* eslint-disable @typescript-eslint/no-unused-vars */
      const {
        theme_options,
        primary_color: _primary_color,
        secondary_color: _secondary_color,
        hero_title_color: _hero_title_color,
        hero_tagline_color: _hero_tagline_color,
        background_color: _background_color,
        footer_data, // Extract footer_data to handle locations separately
        ...tenantUpdates
      } = updates as Record<string, unknown>;
      /* eslint-enable @typescript-eslint/no-unused-vars */

      // If we are updating footer_data, we should remove 'locations' from the JSON stored in 'tenants'
      // to rely on 'tenant_locations' table.
      let finalFooterData = footer_data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const locationsToSave = (footer_data as any)?.locations;

      if (footer_data && locationsToSave) {
        finalFooterData = {
          ...(footer_data as object),
          locations: [] // Clear from JSON
        };
      }

      const updateData: Record<string, unknown> = {
        ...tenantUpdates,
        onboarding_step: nextStep || currentStep,
        onboarding_completed: (nextStep || currentStep) > 2
      };

      if (finalFooterData) {
        updateData.footer_data = finalFooterData;
      }

      console.log('[updateTenant] Updating tenants table with:', updateData);

      // 1. Update Tenant
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from('tenants') as any)
        .update(updateData)
        .eq('id', tenant.id);

      if (error) {
        console.error('[updateTenant] Error updating tenants table:', JSON.stringify(error, null, 2));
        throw error;
      }

      // 2. Update Tenant Locations if present in updates
      if (locationsToSave) {
        // Delete existing
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from('tenant_locations') as any).delete().eq('tenant_id', tenant.id);

        // Insert new
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const locationsInsert = locationsToSave.map((l: any, idx: number) => ({
          tenant_id: tenant.id,
          city: l.city,
          address: l.address,
          phone: l.phone || null,
          opening_hours: l.opening_hours || null,
          is_primary: idx === 0
        }));

        if (locationsInsert.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { error: locError } = await (supabase.from('tenant_locations') as any).insert(locationsInsert);
          if (locError) throw locError;
        }
      }

      // 3. Update Design Settings if theme_options is present
      if (theme_options) {
        console.log('[updateTenant] Updating design settings with:', theme_options);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: designError } = await (supabase.from('tenant_design_settings') as any)
          .upsert({
            tenant_id: tenant.id,
            theme_config: theme_options
          });

        if (designError) {
          console.error('[updateTenant] Error updating design settings:', JSON.stringify(designError, null, 2));
          throw designError;
        }
      }

      return true;
    } catch (err) {
      console.error('Error updating tenant:', err);
      // alert('Error saving changes. Check console for details.'); 
      return false;
    }
  }

  async function handleNext(dataOverride?: unknown) {
    let updates: Partial<typeof formData> = {};

    // Prepara gli update in base allo step corrente
    // Prepara gli update in base allo step corrente
    if (currentStep === 1) {
      updates = {
        restaurant_name: formData.restaurant_name,
        slug: formData.slug || null, // Ensure empty string becomes null to satisfy constraint
        logo_url: formData.logo_url,
        theme_options: dataOverride || formData.theme_options
      };
      // Immediately update local state too in case navigation fails or delays
      if (dataOverride) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setFormData(prev => ({ ...prev, theme_options: dataOverride as any }));
      }
    } else if (currentStep === 2) {
      updates = {
        contact_email: formData.contact_email,
        footer_data: formData.footer_data
      };
    }

    const success = await updateTenant(updates, currentStep + 1);

    if (success) {
      if (currentStep === 2) {
        // Onboarding completato
        router.push('/dashboard');
      } else {
        setCurrentStep(currentStep + 1);
      }
    }
  }

  function handleBack() {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cream to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-roma-red rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white font-bold text-2xl">M</span>
          </div>
          <p className="text-gray-600">Caricamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-xl border-b border-gray-200 py-4 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <img
                src="/logo-gofood-new.svg"
                alt="GO! FOOD"
                className="h-10 w-auto"
              />
            </Link>
            <div className="h-6 w-px bg-orange-200" />
            <span className="font-bold text-gray-600 text-sm">Configurazione iniziale</span>
          </div>
        </div>
      </header>

      {/* Step Indicator */}
      <div className="container mx-auto px-4 py-4 md:py-8">
        <StepIndicator currentStep={currentStep} />
      </div>

      {/* Step Content */}
      <div className="flex-1 flex flex-col min-h-0 relative">
        <div className="h-full flex flex-col flex-1">
          {currentStep === 1 && (
            <div className="flex-1 relative h-full">
              <ThemeProvider>
                <BrandingDesignLab
                  formData={formData}
                  tenantId={tenant?.id}
                  onUpdate={(updates) => setFormData({ ...formData, ...updates })}
                  onNext={handleNext}
                  onBack={handleLogout}
                />
              </ThemeProvider>
            </div>
          )}

          {currentStep === 2 && (
            <div className="container mx-auto px-4 pb-8 md:pb-16 max-w-4xl">
              <FooterConfigurator
                formData={{
                  ...formData,
                  contact_email: formData.contact_email || '',
                }}
                onUpdate={(updates) => setFormData({ ...formData, ...updates })}
                onNext={handleNext}
                onBack={handleBack}
              />
            </div>
          )}
        </div>
      </div>
      {/* Footer */}
      <footer className="bg-white/50 backdrop-blur-sm border-t border-orange-100 py-4 md:py-6 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-500 text-xs md:text-sm mb-2">
            &copy; {new Date().getFullYear()} GoFood. Tutti i diritti riservati.
          </p>
          <div className="flex justify-center gap-4 text-[10px] md:text-xs text-gray-400">
            <a href="https://www.iubenda.com/privacy-policy/23100081" className="iubenda-white iubenda-noiframe iubenda-embed iubenda-noiframe hover:text-orange-500 transition-colors" title="Privacy Policy">Privacy Policy</a>
            <a href="https://www.iubenda.com/privacy-policy/23100081/cookie-policy" className="iubenda-white iubenda-noiframe iubenda-embed iubenda-noiframe hover:text-orange-500 transition-colors" title="Cookie Policy">Cookie Policy</a>
            <a href="mailto:support@gofoodmenu.it" className="hover:text-orange-500 transition-colors">Supporto</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <OnboardingContent />
    </Suspense>
  );
}
