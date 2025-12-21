
'use client';

import { useState, useEffect } from 'react';
import { QRCode } from 'react-qrcode-logo';
// import { createClient } from '@/lib/supabase/client';
import { useTenant } from '@/hooks/useTenant';
import { toast } from 'sonner';

interface QRCodeCardProps {
    slug: string | null;
    restaurantName: string;
    logoUrl?: string;
    tenantId: string;
    isLocked?: boolean;
}

export default function QRCodeCard({ slug, logoUrl, tenantId, isLocked }: QRCodeCardProps) {
    const [isOpen, setIsOpen] = useState(false);

    // QR State
    const { data: tenant } = useTenant();

    // Derive QR settings from tenant data
    const qrConfig = tenant?.theme_options?.qrCode || {};
    const qrColor = qrConfig.qrColor || '#000000';
    const bgColor = qrConfig.bgColor || '#ffffff';
    const includeLogo = qrConfig.includeLogo !== undefined ? qrConfig.includeLogo : true;
    const logoWidth = qrConfig.logoWidth || 60;
    const logoHeight = qrConfig.logoHeight || 60;
    const logoPadding = qrConfig.logoPadding || 5;

    // Logo Data URL State (still needed for canvas)
    const [logoDataUrl, setLogoDataUrl] = useState<string | undefined>(undefined);

    // UI state
    const [fullUrl, setFullUrl] = useState(`https://gofood.it/${slug}`);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setFullUrl(`${window.location.origin}/${slug}`);
        }
    }, [slug]);

    // No need for loadSettings useEffect anymore




    const downloadQRCode = () => {
        const canvas = document.getElementById('react-qrcode-logo') as HTMLCanvasElement;
        if (canvas) {
            const pngUrl = canvas.toDataURL('image/png');
            const downloadLink = document.createElement('a');
            downloadLink.href = pngUrl;
            downloadLink.download = `${slug}-menu-qr.png`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        }
    };

    // Convert logoUrl to Data URL to prevent tainted canvas issues
    useEffect(() => {
        if (!logoUrl || !includeLogo) {
            setLogoDataUrl(undefined);
            return;
        }

        const convertToDataURL = async () => {
            try {
                const response = await fetch(logoUrl);
                const blob = await response.blob();
                const reader = new FileReader();
                reader.onloadend = () => {
                    const result = reader.result as string;
                    setLogoDataUrl(result);
                    // Auto-calculation logic removed in favor of stored settings from Desgin Studio
                };
                reader.readAsDataURL(blob);
            } catch (error) {
                console.error('Error converting logo to Data URL:', error);
                // Fallback to original URL if conversion fails (might still error on download but better than nothing)
                setLogoDataUrl(logoUrl);
            }
        };

        convertToDataURL();
    }, [logoUrl, includeLogo]);

    // Use the Data URL version for the QR code
    const activeLogo = includeLogo ? (logoDataUrl || '/logo-gofood.png') : undefined;

    return (
        <>
            {/* Dashboard Card Trigger */}
            <div
                onClick={() => slug && !isLocked && setIsOpen(true)}
                className={`bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 flex flex-col items-center justify-center text-center relative overflow-hidden ${slug && !isLocked ? 'cursor-pointer hover:shadow-md transition-shadow group' : 'opacity-80'}`}
            >
                {!slug && (
                    <div className="absolute inset-0 bg-gray-50/50 backdrop-blur-[1px] z-10 flex flex-col items-center justify-center">
                        <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-2 shadow-sm">
                            <span className="text-2xl">⚠️</span>
                        </div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Attivazione Richiesta</p>
                    </div>
                )}
                {slug && isLocked && (
                    <div className="absolute inset-0 bg-gray-50/50 backdrop-blur-[1px] z-10 flex flex-col items-center justify-center">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-2 shadow-sm">
                            <span className="text-2xl text-gray-500">🔒</span>
                        </div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Premium</p>
                    </div>
                )}
                <div className="absolute top-2 right-2 text-gray-300">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </div>

                <div className="mb-3 transform group-hover:scale-105 transition-transform duration-300">
                    <QRCode
                        value={fullUrl || 'https://gofood.it'}
                        size={100}
                        bgColor={bgColor}
                        fgColor={qrColor}
                        logoImage={activeLogo}
                        logoWidth={logoWidth * (100 / 280)}
                        logoHeight={logoHeight * (100 / 280)}
                        logoOpacity={1}
                        logoPadding={logoPadding * (100 / 280)}
                        logoPaddingStyle="circle"
                        removeQrCodeBehindLogo={true}
                        qrStyle="dots"
                        eyeRadius={5}
                        ecLevel="H"
                        id="dashboard-qr-preview"
                    />
                </div>

                <div className="text-sm font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                    Il tuo QR Menu
                </div>
                <p className="text-xs text-gray-500 mt-1">Clicca per modificare</p>
            </div>

            {/* Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
                    <div
                        className="bg-white rounded-2xl w-full max-w-lg p-6 md:p-8 shadow-2xl flex flex-col items-center animate-in fade-in zoom-in duration-200"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="w-full flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Il tuo QR Code</h2>
                            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100 mb-8">
                            <QRCode
                                value={fullUrl}
                                size={280}
                                bgColor={bgColor}
                                fgColor={qrColor}
                                logoImage={activeLogo}
                                logoWidth={logoWidth}
                                logoHeight={logoHeight}
                                logoOpacity={1}
                                logoPadding={logoPadding}
                                logoPaddingStyle="circle"
                                removeQrCodeBehindLogo={true}
                                qrStyle="dots"
                                eyeRadius={10}
                                ecLevel="H"
                                id="react-qrcode-logo"
                            />
                        </div>

                        <div className="w-full space-y-4">
                            <button
                                onClick={downloadQRCode}
                                className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-bold flex items-center justify-center gap-3 hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                <span>Scarica QR Code (.png)</span>
                            </button>
                            <p className="text-center text-xs text-gray-400">
                                Link diretto: <span className="font-mono">{fullUrl}</span>
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
