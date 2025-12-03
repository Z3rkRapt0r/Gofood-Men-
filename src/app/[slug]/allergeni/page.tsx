import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Tenant } from '@/types/menu';
import AllergensPageClient from './AllergensPageClient';

interface PageProps {
    params: Promise<{ slug: string }>;
}

// Fetch tenant data dal database
async function getTenantData(slug: string) {
    const supabase = await createClient();

    const { data: tenant, error } = await supabase
        .from('tenants')
        .select('*')
        .eq('slug', slug)
        .single();

    if (error || !tenant) {
        return null;
    }

    return tenant as Tenant;
}

export default async function Page({ params }: PageProps) {
    const { slug } = await params;
    const tenant = await getTenantData(slug);

    if (!tenant) {
        notFound();
    }

    return <AllergensPageClient tenant={tenant} />;
}

// Metadata dinamici per SEO
export async function generateMetadata({ params }: PageProps) {
    const { slug } = await params;
    const supabase = await createClient();

    const { data: tenant } = await supabase
        .from('tenants')
        .select('restaurant_name')
        .eq('slug', slug)
        .single();

    if (!tenant) {
        return {
            title: 'Ristorante non trovato',
        };
    }

    const tenantData = tenant as { restaurant_name: string };

    return {
        title: `Allergeni - ${tenantData.restaurant_name}`,
        description: `Lista degli allergeni e informazioni legali per ${tenantData.restaurant_name}.`,
    };
}
