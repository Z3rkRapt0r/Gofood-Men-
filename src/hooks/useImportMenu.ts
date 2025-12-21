import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

interface Dish {
    name: string;
    description: string;
    price: number;
    categoryId?: string;
    selected?: boolean;
    slug?: string;
}

export function useImportMenu() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ tenantId, dishes }: { tenantId: string, dishes: Dish[] }) => {
            const supabase = createClient();

            // Filter valid dishes
            const validDishes = dishes.filter(d => d.selected && d.categoryId);

            if (validDishes.length === 0) return 0;

            const preparedItems = validDishes.map(dish => ({
                tenant_id: tenantId,
                category_id: dish.categoryId!,
                name: dish.name,
                description: dish.description,
                price: dish.price,
                is_visible: true,
                slug: dish.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            }));

            // Deduplicate (client-side)
            const uniqueItemsMap = new Map();
            preparedItems.forEach(item => {
                const key = `${item.category_id}-${item.slug}`;
                if (!uniqueItemsMap.has(key)) {
                    uniqueItemsMap.set(key, item);
                }
            });
            const uniqueItems = Array.from(uniqueItemsMap.values());

            // Perform batch insert
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error } = await (supabase.from('dishes') as any)
                .upsert(uniqueItems, {
                    onConflict: 'tenant_id,category_id,slug',
                    ignoreDuplicates: true
                });

            if (error) throw error;
            return uniqueItems.length;
        },
        onSuccess: (count, variables) => {
            // Invalidate queries to refresh dashboard stats
            queryClient.invalidateQueries({ queryKey: ['dishes', variables.tenantId] });
            queryClient.invalidateQueries({ queryKey: ['stats', variables.tenantId] }); // in case we have a stats query
            // also tenant potentially if stats are in tenant object (unlikely here)
            toast.success(`${count} piatti importati con successo!`);
        },
        onError: (error) => {
            console.error('Import error:', error);
            toast.error('Errore durante l\'importazione dei piatti');
        }
    });
}
