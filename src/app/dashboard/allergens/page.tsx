'use client';

import { useTenant } from '@/hooks/useTenant';
import { CharacteristicsManager } from '@/components/dashboard/CharacteristicsManager';
import { Loader2 } from 'lucide-react';

export default function AllergensPage() {
    const { data: tenant, isLoading } = useTenant();

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!tenant) {
        return <div>Tenant non trovato</div>;
    }

    return (
        <div className="flex flex-col h-full bg-slate-50">
            <header className="flex h-14 items-center gap-4 border-b bg-white px-6">
                <h1 className="font-semibold text-lg">Gestione Allergeni e Caratteristiche</h1>
            </header>
            <main className="flex-1 p-6 md:p-8 overflow-y-auto">
                <div className="mx-auto max-w-5xl">
                    <CharacteristicsManager tenantId={tenant.id} />
                </div>
            </main>
        </div>
    );
}
