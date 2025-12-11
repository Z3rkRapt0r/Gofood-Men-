'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import toast from 'react-hot-toast';

interface ActivationModalProps {
    isOpen: boolean;
    onClose: () => void;
    restaurantName: string;
}

export default function ActivationModal({ isOpen, onClose, restaurantName }: ActivationModalProps) {
    const [slug, setSlug] = useState('');
    const [loading, setLoading] = useState(false);


    // Auto-generate slug suggestion from restaurant name when modal opens
    // Use useEffect because onOpenChange from custom Dialog might not trigger for opening
    useEffect(() => {
        if (isOpen && restaurantName && !slug) {
            setSlug(restaurantName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, ''));
        }
    }, [isOpen, restaurantName, slug]);



    const handleActivate = async () => {
        if (!slug) {
            toast.error('Inserisci un indirizzo per il tuo menu');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    desiredSlug: slug,
                    returnUrl: window.location.origin
                })
            });

            if (!response.ok) {
                const msg = await response.text();
                throw new Error(msg || 'Errore durante l\'iniziazione del pagamento');
            }

            const { url } = await response.json();
            window.location.href = url;
        } catch (error) {
            console.error('Activation error:', error);
            toast.error(error instanceof Error ? error.message : 'Errore sconosciuto');
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Attiva il tuo Menu Digitale 🚀</DialogTitle>
                    <DialogDescription>
                        Scegli l&apos;indirizzo web definitivo per il tuo menu e sblocca tutte le funzionalità.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div>
                        <label className="text-sm font-bold text-gray-900 block mb-2">
                            Il tuo indirizzo web
                        </label>
                        <div className="flex items-center gap-2 p-3 bg-gray-100 rounded-lg border border-gray-200">
                            <span className="text-gray-500 font-mono text-sm">gofood.it/</span>
                            <span className="font-bold text-gray-900">{slug}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            L&apos;indirizzo viene generato automaticamente in base al nome del tuo ristorante.
                        </p>
                        <p className="text-xs text-blue-600 mt-1 font-semibold">
                            ℹ️ È possibile cambiare l&apos;indirizzo contattando l&apos;assistenza dopo il pagamento.
                        </p>
                    </div>

                    <div className="bg-orange-50 p-4 rounded-lg flex items-start gap-3 border border-orange-100">
                        <span className="text-xl">⭐</span>
                        <div>
                            <h4 className="font-bold text-orange-900 text-sm">Cosa ottieni attivando:</h4>
                            <ul className="text-xs text-orange-800 mt-1 space-y-1">
                                <li>• Link pubblico personalizzato</li>
                                <li>• Generazione QR Code</li>
                                <li>• Piatti e categorie illimitati</li>
                                <li>• Supporto prioritario</li>
                            </ul>
                        </div>
                    </div>

                    <button
                        onClick={handleActivate}
                        disabled={loading || !slug}
                        className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-3 rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>Redirect al pagamento...</span>
                            </>
                        ) : (
                            <>
                                <span>Procedi al Pagamento</span>
                                <span className="text-sm opacity-90 px-2 bg-white/20 rounded-full">€19,90/mese</span>
                            </>
                        )}
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
