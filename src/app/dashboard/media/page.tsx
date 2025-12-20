'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import PhotoManager from '@/components/media/PhotoManager';
import { Loader2 } from 'lucide-react';

export default function MediaPage() {
    const [tenantId, setTenantId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadTenant() {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: tenant } = await (supabase.from('tenants') as any)
                .select('id')
                .eq('owner_id', user.id)
                .single();

            if (tenant) {
                setTenantId(tenant.id);
            }
            setLoading(false);
        }
        loadTenant();
    }, []);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
        );
    }

    if (!tenantId) {
        return (
            <div className="text-center p-10">
                Nessun ristorante trovato.
            </div>
        );
    }

    return (
        <div className="p-6 h-[calc(100vh-64px)] overflow-hidden flex flex-col">
            <div className="mb-6 flex-shrink-0">
                <h1 className="text-3xl font-black text-gray-900 mb-2">Galleria Foto 📸</h1>
                <p className="text-gray-500">
                    Carica le foto dei tuoi piatti in blocco e assegnale trascinandole.
                </p>
            </div>

            <div className="flex-1 min-h-0">
                <PhotoManager tenantId={tenantId} />
            </div>
        </div>
    );
}
