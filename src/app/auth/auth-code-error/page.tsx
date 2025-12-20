'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

function AuthErrorContent() {
    const searchParams = useSearchParams();
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    return (
        <Card className="w-full max-w-md shadow-xl border-orange-100">
            <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <span className="text-3xl">⚠️</span>
                </div>
                <CardTitle className="text-2xl font-black text-gray-900">
                    Errore di Autenticazione
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
                <p className="text-gray-600">
                    C'è stato un problema durante l'accesso o il ripristino della password.
                </p>

                {(error || errorDescription) && (
                    <div className="bg-red-50 p-4 rounded-lg text-left text-sm text-red-700 border border-red-100 overflow-x-auto">
                        {error && <p className="font-bold">Error: {error}</p>}
                        {errorDescription && <p>Details: {errorDescription}</p>}
                    </div>
                )}

                <div className="pt-4 space-y-2">
                    <Link href="/login">
                        <Button className="w-full bg-orange-500 hover:bg-orange-600 font-bold">
                            Torna al Login
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}

export default function AuthCodeErrorPage() {
    return (
        <div className="min-h-screen bg-orange-50 flex items-center justify-center p-4">
            <Suspense fallback={<Loader2 className="w-8 h-8 animate-spin text-orange-500" />}>
                <AuthErrorContent />
            </Suspense>
        </div>
    );
}
