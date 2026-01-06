
import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://gofood-menu.com'; // Replace with your actual domain
    const supabase = await createClient();

    // 1. Static Pages
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 1,
        },
        {
            url: `${baseUrl}/login`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: `${baseUrl}/register`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
    ];

    // 2. Dynamic Tenant Pages
    // Fetch all active tenants
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: tenants } = await (supabase.from('tenants') as any)
        .select('slug, updated_at')
        .eq('subscription_status', 'active');

    const tenantPages: MetadataRoute.Sitemap = (tenants || []).map((tenant: { slug: string; updated_at: string }) => ({
        url: `${baseUrl}/${tenant.slug}`,
        lastModified: new Date(tenant.updated_at),
        changeFrequency: 'daily',
        priority: 0.9,
    }));

    return [...staticPages, ...tenantPages];
}
