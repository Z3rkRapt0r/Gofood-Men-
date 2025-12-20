'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import type { Tenant } from '@/types/menu';
import { OnboardingWizard } from '@/components/onboarding/wizard/OnboardingWizard';
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
  cover_charge?: number;
  tagline?: string;
  onboarding_step?: number;
  onboarding_completed?: boolean;
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
          tagline: existingFooterData.tagline || tenantData.tagline || '', // Migration logic
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
    if (!tenant) return false;

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

      // Auto-generate slug if missing or empty string, based on restaurant name
      let slugToSave = (updateData.slug as string) || (tenant.slug as string);

      // If we have a new restaurant name, we might want to regenerate the slug if it's currently empty
      // or if we want to keep it in sync (optional, but safer for onboarding).
      // For now, let's ensure we NEVER save an empty string as slug.
      const nameSource = (updateData.restaurant_name as string) || (tenant.restaurant_name as string);

      if (!slugToSave || slugToSave.trim() === '') {
        if (nameSource) {
          slugToSave = nameSource
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '') // Remove non-word chars (except spaces/dashes)
            .replace(/[\s_-]+/g, '-') // Replace spaces/underscores with single dash
            .replace(/^-+|-+$/g, ''); // Trim dashes

          // Fallback if slug becomes empty (e.g. from "???")
          if (!slugToSave) slugToSave = `restaurant-${Date.now()}`;

          updateData.slug = slugToSave;
        }
      } else if (updateData.slug === '') {
        // Explicitly empty string passed? Treat as null or regenerate
        // If the DB constraint forbids empty string, we MUST fix it.
        // Since we already handled the !slugToSave case above, this branch covers the case
        // where updateData.slug IS set but is empty string.
        if (nameSource) {
          slugToSave = nameSource
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
          if (!slugToSave) slugToSave = `restaurant-${Date.now()}`;
          updateData.slug = slugToSave;
        }
      }

      if (updates.contact_email !== undefined) updateData.contact_email = updates.contact_email;
      if (updates.cover_charge !== undefined) updateData.cover_charge = updates.cover_charge;
      // Tagline is now part of footer_data, no need to save to column anymore

      if (updates.footer_data) {
        updateData.footer_data = updates.footer_data;

        // Sync Locations to tenant_locations table
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const locations = (updates.footer_data as any).locations || [];
        if (locations.length > 0) {
          // 1. Delete old
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase.from('tenant_locations') as any).delete().eq('tenant_id', tenant.id);

          // 2. Insert new
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const locsToInsert = locations.map((loc: any, idx: number) => ({
            tenant_id: tenant.id,
            city: loc.city,
            address: loc.address,
            phone: loc.phone || null,
            opening_hours: loc.opening_hours || null,
            is_primary: idx === 0
          }));

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase.from('tenant_locations') as any).insert(locsToInsert);
        }
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

      // 4. Redirect if completed
      if ((nextStep || currentStep) > 2) {
        router.push('/dashboard');
      }

      return true;
    } catch (err) {
      console.error('Error updating tenant:', err);
      // alert('Error saving changes. Check console for details.'); 
      return false;
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
      {/* Helper header for brand presence */}


      <OnboardingWizard
        initialData={formData}
        tenantId={tenant?.id}
        currentStepProp={currentStep}
        onUpdate={async (data, nextStep) => {
          // Flatten data effectively
          const updates = { ...data };
          const result = await updateTenant(updates, nextStep);
          return !!result;
        }}
        onExit={handleLogout}
      />
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
