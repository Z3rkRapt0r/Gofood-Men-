import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

// --- Types ---
export interface Category {
    id: string;
    name: string;
    description?: string | null;
    slug: string;
    display_order: number;
    is_visible: boolean;
    tenant_id: string;
}

export interface Dish {
    id: string;
    name: string;
    description?: string;
    price: number;
    category_id: string;
    is_visible: boolean;
    image_url?: string | null;
    display_order: number;
    tenant_id: string;
    slug?: string;
    is_seasonal?: boolean;
    is_vegetarian?: boolean;
    is_vegan?: boolean;
    is_gluten_free?: boolean;
    is_homemade?: boolean;
    is_frozen?: boolean;
    allergen_ids?: string[];
}

export interface Allergen {
    id: string;
    name: string;
    icon: string;
}

// --- Queries ---

export function useCategories(tenantId: string | undefined) {
    return useQuery({
        queryKey: ['categories', tenantId],
        queryFn: async () => {
            if (!tenantId) return [];
            const supabase = createClient();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data, error } = await (supabase.from('categories') as any)
                .select('*')
                .eq('tenant_id', tenantId)
                .order('display_order', { ascending: true });

            if (error) throw error;
            return data as Category[];
        },
        enabled: !!tenantId,
    });
}

export function useDishes(tenantId: string | undefined) {
    return useQuery({
        queryKey: ['dishes', tenantId],
        queryFn: async () => {
            if (!tenantId) return [];
            const supabase = createClient();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data, error } = await (supabase.from('dishes') as any)
                .select('*')
                .eq('tenant_id', tenantId)
                .order('display_order', { ascending: true });

            if (error) throw error;
            return data as Dish[];
        },
        enabled: !!tenantId,
    });
}

export function useAllergens() {
    return useQuery({
        queryKey: ['allergens'],
        queryFn: async () => {
            const supabase = createClient();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data, error } = await (supabase.from('allergens') as any).select('*').order('name');
            if (error) throw error;
            return data as Allergen[];
        }
    });
}


// --- Mutations ---

// Categories
export function useAddCategory() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ tenantId, name, displayOrder }: { tenantId: string, name: string, displayOrder: number }) => {
            const supabase = createClient();
            const slug = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data, error } = await (supabase.from('categories') as any)
                .insert({
                    tenant_id: tenantId,
                    name: name,
                    slug: slug,
                    display_order: displayOrder,
                    is_visible: true
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['categories', variables.tenantId] });
            // Toast managed by component usually to show name
        }
    });
}

export function useUpdateCategory() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, updates }: { id: string, updates: Partial<Category> }) => {
            const supabase = createClient();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error } = await (supabase.from('categories') as any)
                .update(updates)
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        }
    });
}

export function useDeleteCategory() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id }: { id: string }) => {
            const supabase = createClient();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error } = await (supabase.from('categories') as any).delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] }); // Invalidate all categories queries or specific if we passed tenantId
            // Since we might not have tenantId here easily without prop, we can invalidate all 'categories' keys. 
            // Ideally we pass tenantId to context or mutation variables.
            // But simpler is to invalidate broadly or pass context.
            // Let's invalidate 'categories' generally.
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        }
    });
}

export function useReorderCategories() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ updates }: { updates: any[] }) => {
            const supabase = createClient();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error } = await (supabase.from('categories') as any).upsert(updates, { onConflict: 'id' });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        }
    });
}

// Dishes
export function useAddDish() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (dish: Partial<Dish>) => {
            const supabase = createClient();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data, error } = await (supabase.from('dishes') as any).insert(dish).select().single();
            if (error) throw error;
            return data;
        },
        onSuccess: (_, variables) => {
            if (variables.tenant_id) {
                queryClient.invalidateQueries({ queryKey: ['dishes', variables.tenant_id] });
            }
        }
    });
}

export function useUpdateDish() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, updates }: { id: string, updates: Partial<Dish> }) => {
            const supabase = createClient();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error } = await (supabase.from('dishes') as any).update(updates).eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dishes'] });
        }
    });
}

export function useDeleteDish() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id }: { id: string }) => {
            const supabase = createClient();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error } = await (supabase.from('dishes') as any).delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dishes'] });
        }
    });
}

export function useReorderDishes() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ updates }: { updates: any[] }) => {
            const supabase = createClient();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error } = await (supabase.from('dishes') as any)
                .upsert(updates, { onConflict: 'id' });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dishes'] });
        }
    });
}
