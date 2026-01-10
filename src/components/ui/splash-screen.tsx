"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface SplashScreenProps {
    onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        // Start exit animation after 2.5s (increased duration)
        const timer = setTimeout(() => {
            setIsVisible(false);
        }, 2500);

        // Call onComplete after animation finishes (700ms transition)
        const cleanup = setTimeout(() => {
            onComplete();
        }, 3200);

        return () => {
            clearTimeout(timer);
            clearTimeout(cleanup);
        };
    }, [onComplete]);

    return (
        <div
            className={`fixed inset-0 z-[100] flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-amber-50 transition-opacity duration-700 ease-in-out ${isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
        >
            <div className="text-center animate-in fade-in zoom-in duration-700 slide-in-from-bottom-4">
                <div className="relative w-56 h-20 mb-6 mx-auto">
                    <Image
                        src="/logo-gofood-new.svg"
                        alt="Gofood Menù"
                        fill
                        className="object-contain"
                        priority
                    />
                </div>

                {/* Catchy Text / Slogan */}
                <div className="space-y-2">
                    <h2 className="text-2xl font-display font-black text-gray-900 tracking-tight">
                        Il tuo Menu Digitale
                    </h2>
                    <p className="text-orange-600 font-medium animate-pulse">
                        Caricamento in corso...
                    </p>
                </div>

                {/* Loading Bar */}
                <div className="h-1.5 w-32 bg-orange-100 rounded-full mx-auto mt-8 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full w-full animate-[progress_2s_ease-in-out_infinite]" />
                </div>
            </div>
        </div>
    );
}
