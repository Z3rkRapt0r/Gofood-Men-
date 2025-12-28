'use client';

import { useTenant } from '@/hooks/useTenant';
import PhotoManager from '@/components/media/PhotoManager';
import { Loader2 } from 'lucide-react';

export default function MediaPage() {
    const { data: tenant, isLoading } = useTenant();

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
        );
    }

    if (!tenant) {
        return (
            <div className="text-center p-10">
                Nessun ristorante trovato.
            </div>
        );
    }

    return (
        <div className="flex-1 w-full md:container mx-auto max-w-5xl px-0 md:p-6 pb-20">
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white border-y md:border border-gray-100 rounded-none md:rounded-xl p-2 md:p-6 shadow-none md:shadow-sm">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                                📸 Galleria Foto
                            </h1>
                        </div>
                    </div>

                    <PhotoManager tenantId={tenant.id} />
                </div>
            </div>
        </div>
    );
}
