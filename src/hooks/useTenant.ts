import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { Tenant } from '@/types/menu';
import { toast } from 'sonner';

export interface TenantData extends Tenant {
    tenant_locations?: any[];
    footer_data?: any;
    theme_options?: any;
    // Legacy fields that might still be in DB but not in strict Tenant type
    primary_color?: string;
    secondary_color?: string;
    background_color?: string;
    surface_color?: string;
    text_color?: string;
    secondary_text_color?: string;
    hero_title_color?: string;
    hero_tagline_color?: string;
    tagline?: string;
}

async function fetchTenant() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('User not authenticated');

    // 1. Fetch Tenant
    let { data: tenant, error } = await (supabase
        .from('tenants') as any)
        .select('*, tenant_locations(*)')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error) throw error;

    // 2. Create if not exists
    if (!tenant) {
        const restaurantName = user.user_metadata?.restaurant_name || 'Il Mio Ristorante';
        const { data: newTenant, error: createError } = await (supabase.from('tenants') as any)
            .insert({
                owner_id: user.id,
                restaurant_name: restaurantName,
                slug: null,
                onboarding_completed: false,
                onboarding_step: 1,
                subscription_tier: 'free',
            })
            .select()
            .single();

        if (createError) throw createError;
        tenant = newTenant;

        await (supabase.from('tenant_design_settings') as any).insert({
            tenant_id: tenant!.id, // tenant is definitely assigned here if no error
            theme_config: {}
        });
    }

    if (!tenant) throw new Error("Tenant could not be initialized");

    // 3. Fetch Design Settings
    const { data: designData } = await (supabase.from('tenant_design_settings') as any)
        .select('theme_config')
        .eq('tenant_id', tenant.id)
        .single();

    // Merge data
    const uiLocations = (tenant.tenant_locations || []).map((l: any) => ({
        city: l.city,
        address: l.address,
        phone: l.phone || '',
        opening_hours: l.opening_hours || ''
    }));

    const existingFooterData = tenant.footer_data || { links: [], socials: [], show_brand_column: true };
    const mergedFooterData = {
        ...existingFooterData,
        tagline: existingFooterData.tagline || tenant.tagline || '',
        locations: uiLocations.length > 0 ? uiLocations : (existingFooterData.locations || [])
    };

    return {
        ...tenant,
        footer_data: mergedFooterData,
        theme_options: designData?.theme_config || null
    } as TenantData;
}

export function useTenant() {
    return useQuery({
        queryKey: ['tenant'],
        queryFn: fetchTenant,
        staleTime: Infinity,
    });
}

export function useUpdateTenant() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, updates, nextStep }: { id: string, updates: any, nextStep?: number }) => {
            const supabase = createClient();

            // Re-fetch current tenant to get slug/name if needed (or pass them in updates)
            // But we have 'id'. We can optimize later. For now, let's assume we might need current data.
            // Actually, best to fetch fresh if we are generating slug.
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: currentTenant } = await (supabase.from('tenants') as any).select('slug, restaurant_name').eq('id', id).single();
            if (!currentTenant) throw new Error("Tenant not found");

            /* eslint-disable @typescript-eslint/no-unused-vars */
            const {
                theme_options,
                primary_color,
                secondary_color,
                hero_title_color,
                hero_tagline_color,
                background_color,
                footer_data,
                tenant_locations, // Remove from update payload
                ...tenantUpdates
            } = updates;
            /* eslint-enable @typescript-eslint/no-unused-vars */

            let finalFooterData = footer_data;
            const locationsToSave = footer_data?.locations;

            if (footer_data && locationsToSave) {
                finalFooterData = {
                    ...footer_data,
                    locations: [] // Clear from JSON, stored in table
                };
            }

            const currentOnboardingStep = updates.onboarding_step || 1; // Fallback

            // Calculate connection to onboarding completion
            // We need to know previous step? 
            // The updates usually contain onboarding_step if passed from wizard.
            // Logic: onboarding_completed = step > 5

            const updateData: any = {
                ...tenantUpdates,
                // If nextStep is provided, use it. Otherwise use what's in updates or current.
                // Actually, logic in page.tsx was: (nextStep || currentStep).
                // Here we receive 'updates' which might have 'onboarding_step'.
            };

            if (nextStep) {
                updateData.onboarding_step = nextStep;
                updateData.onboarding_completed = nextStep > 6;
            } else if (updates.onboarding_step) {
                updateData.onboarding_completed = updates.onboarding_step > 6;
            }

            // Slug Logic
            let slugToSave = updateData.slug || currentTenant.slug;
            const nameSource = updateData.restaurant_name || currentTenant.restaurant_name;

            if (!slugToSave || slugToSave.trim() === '') {
                if (nameSource) {
                    slugToSave = nameSource.toLowerCase().trim()
                        .replace(/[^\w\s-]/g, '')
                        .replace(/[\s_-]+/g, '-')
                        .replace(/^-+|-+$/g, '');
                    if (!slugToSave) slugToSave = `restaurant-${Date.now()}`;
                    updateData.slug = slugToSave;
                }
            }

            if (updates.contact_email !== undefined) updateData.contact_email = updates.contact_email;
            if (updates.cover_charge !== undefined) updateData.cover_charge = updates.cover_charge;

            if (finalFooterData) {
                updateData.footer_data = finalFooterData;

                // Sync Locations
                const locations = locationsToSave;
                if (locations) {
                    // Delete old (always clear if we are updating locations)
                    await (supabase.from('tenant_locations') as any).delete().eq('tenant_id', id);

                    if (locations.length > 0) {
                        // Insert new
                        const locsToInsert = locations.map((loc: any, idx: number) => ({
                            tenant_id: id,
                            city: loc.city,
                            address: loc.address,
                            phone: loc.phone || null,
                            opening_hours: loc.opening_hours || null,
                            is_primary: idx === 0
                        }));
                        await (supabase.from('tenant_locations') as any).insert(locsToInsert);
                    }
                }
            }

            // 1. Update Tenant
            const { error: updateError } = await (supabase.from('tenants') as any)
                .update(updateData)
                .eq('id', id);

            if (updateError) throw updateError;

            // 2. Update Design Settings
            if (theme_options) {
                await (supabase.from('tenant_design_settings') as any)
                    .upsert({
                        tenant_id: id,
                        theme_config: theme_options
                    });
            }

            return true;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tenant'] });
            toast.success('Dati salvati!');
        },
        onError: (error) => {
            console.error("Mutation Error:", error);
            toast.error('Errore nel salvataggio');
        }
    })
}
