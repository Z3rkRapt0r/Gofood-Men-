import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

export function useCheckSlug(slug: string | null, currentSlug?: string | null) {
    return useQuery({
        queryKey: ['checkSlug', slug],
        queryFn: async () => {
            if (!slug) return { available: false, error: 'Slug empty' };

            const supabase = createClient();
            const { data } = await supabase
                .from('tenants')
                .select('slug')
                .eq('slug', slug)
                // If checking against own slug (update scenarios), we might want to allow it
                // but typically we check availability of *other* slugs.
                // For onboarding, we don't have a "currentSlug" usually, or it's empty.
                .neq('slug', currentSlug || '')
                .maybeSingle();

            return { available: !data };
        },
        enabled: !!slug && slug.length > 2,
        staleTime: 1000 * 60, // 1 minute cache
        retry: false
    });
}
