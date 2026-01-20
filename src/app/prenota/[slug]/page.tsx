import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ReservationPageClient } from '@/components/reservations/ReservationPageClient';
import { ReservationConfig, ReservationSettings, TableConfig, ReservationShift } from '@/components/reservations/types';
import { Tenant } from '@/types/menu';

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
    const { slug } = await params;
    const supabase = await createClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: tenant } = await (supabase.from('tenants') as any)
        .select('restaurant_name, logo_url')
        .eq('slug', slug)
        .single();

    if (!tenant) return { title: 'Ristorante non trovato' };

    return {
        title: `Prenota da ${tenant.restaurant_name}`,
        description: `Prenota il tuo tavolo online da ${tenant.restaurant_name}. Veloce, semplice e sicuro.`,
        openGraph: {
            title: `Prenota da ${tenant.restaurant_name}`,
            description: `Prenota il tuo tavolo online da ${tenant.restaurant_name}.`,
            images: tenant.logo_url ? [tenant.logo_url] : [],
        }
    };
}

export default async function ReservationPage({ params }: PageProps) {
    const { slug } = await params;
    const supabase = await createClient();

    // 1. Fetch Tenant
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: tenant } = await (supabase.from('tenants') as any)
        .select('*')
        .eq('slug', slug)
        .single();

    if (!tenant) {
        notFound();
    }

    // 2. Fetch Reservation Config (Settings, Tables, Shifts)
    // Note: RLS allows 'anon' to read these tables as long as criteria are met.

    // Settings
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: settings } = await (supabase.from('reservation_settings') as any)
        .select('*')
        .eq('tenant_id', tenant.id)
        .single();

    // Tables
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: tables } = await (supabase.from('reservation_tables') as any)
        .select('*')
        .eq('tenant_id', tenant.id)
        .eq('is_active', true)
        .order('display_order');

    // Shifts
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: shifts } = await (supabase.from('reservation_shifts') as any)
        .select('*')
        .eq('tenant_id', tenant.id)
        .eq('is_active', true);

    // Default configuration if nothing found (or minimal active config)
    const config: ReservationConfig = {
        isActive: settings?.is_active ?? false,
        totalSeats: settings?.total_seats ?? 0,
        totalHighChairs: settings?.total_high_chairs ?? 0,

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        tables: (tables || []).map((t: any) => ({
            id: t.id,
            name: t.name,
            seats: t.seats,
            isActive: t.is_active
        })),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        shifts: (shifts || []).map((s: any) => ({
            id: s.id,
            name: s.name,
            startTime: s.start_time.slice(0, 5), // 'HH:MM:SS' -> 'HH:MM'
            endTime: s.end_time.slice(0, 5),
            daysOfWeek: s.days_of_week || [],
            isActive: s.is_active
        }))
    };

    return (
        <ReservationPageClient
            tenant={tenant as Tenant}
            config={config}
        />
    );
}
