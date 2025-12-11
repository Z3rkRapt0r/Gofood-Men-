import { useEffect, useState } from 'react';
import Link from 'next/link';

// Component to prompt trial users to subscribe
// Should appear in dashboard layout or top of dashboard pages
export default function SubscriptionBanner() {
    const [show, setShow] = useState(true);

    if (!show) return null;

    return (
        <div className="bg-indigo-600 text-white px-4 py-3 shadow-lg">
            <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">🎁</span>
                    <div>
                        <p className="font-bold">Sei in prova gratuita!</p>
                        <p className="text-sm text-indigo-100">Hai accesso completo a tutte le funzionalità Premium.</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <a
                        href="https://buy.stripe.com/test_9B65kD0dt3ed9FkgJcf3a00"
                        className="whitespace-nowrap bg-white text-indigo-600 font-bold py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors text-sm w-full sm:w-auto text-center"
                    >
                        Abbonati Ora - €19,90/mese
                    </a>
                    <button
                        onClick={() => setShow(false)}
                        className="text-indigo-300 hover:text-white"
                    >
                        ✕
                    </button>
                </div>
            </div>
        </div>
    );
}
