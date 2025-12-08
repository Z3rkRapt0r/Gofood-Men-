'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [tenant, setTenant] = useState<Tenant | null>(null);

  const [formData, setFormData] = useState({
    subscription_tier: 'free' as SubscriptionTier,
    restaurant_name: '',
    slug: '',
    logo_url: null as string | null,
    primary_color: '#8B0000',
    secondary_color: '#D4AF37',
    contact_email: '',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    theme_options: null as any,
    footer_data: undefined as FooterData | undefined
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
          const tempSlug = `restaurant-${user.id.substring(0, 8)}`;

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data: newTenant, error: createError } = await (supabase.from('tenants') as any)
            .insert({
              owner_id: user.id,
              restaurant_name: restaurantName,
              slug: tempSlug,
              onboarding_completed: false,
              onboarding_step: 1,
              subscription_tier: 'free',
              max_dishes: 9999,
              max_categories: 9999
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
        setCurrentStep(tenantData.onboarding_step || 1);
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
        onboarding_completed: nextStep === 4
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
    if (currentStep === 1) {
      updates = { subscription_tier: formData.subscription_tier };
    } else if (currentStep === 2) {
      updates = {
        restaurant_name: formData.restaurant_name,
        slug: formData.slug,
        logo_url: formData.logo_url,
        theme_options: dataOverride || formData.theme_options
      };
      // Immediately update local state too in case navigation fails or delays
      if (dataOverride) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setFormData(prev => ({ ...prev, theme_options: dataOverride as any }));
      }
    } else if (currentStep === 3) {
      updates = {
        contact_email: formData.contact_email,
        footer_data: formData.footer_data
      };
    }

    const success = await updateTenant(updates, currentStep + 1);

    if (success) {
      if (currentStep === 3) {
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-xl border-b border-orange-100 py-4 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Image
                src="/logo-gofood.png"
                alt="GO! FOOD"
                width={120}
                height={50}
                className="h-10 w-auto"
              />
            </Link>
            <div className="h-6 w-px bg-orange-200" />
            <span className="font-bold text-gray-600 text-sm">Configurazione iniziale</span>
          </div>
        </div>
      </header>

      {/* Step Indicator */}
      <div className="container mx-auto px-4 py-8">
        <StepIndicator currentStep={currentStep} />
      </div>

      {/* Step Content */}
      <div className="container mx-auto px-4 pb-16">
        <div className={`mx-auto ${currentStep === 2 ? 'max-w-7xl' : 'max-w-4xl'}`}>


          {currentStep === 1 && (
            <PlanSelector
              selectedPlan={formData.subscription_tier}
              onSelectPlan={(tier: SubscriptionTier) => setFormData({ ...formData, subscription_tier: tier })}
              onNext={handleNext}
            />
          )}

          {currentStep === 2 && (
            <div className="h-[calc(100vh-140px)] min-h-[600px]">
              <ThemeProvider>
                <BrandingDesignLab
                  formData={formData}
                  onUpdate={(updates) => setFormData({ ...formData, ...updates })}
                  onNext={handleNext}
                  onBack={handleBack}
                />
              </ThemeProvider>
            </div>
          )}

          {currentStep === 3 && (
            <FooterConfigurator
              formData={formData}
              onUpdate={(updates) => setFormData({ ...formData, ...updates })}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
        </div>
      </div>
    </div>
  );
}
