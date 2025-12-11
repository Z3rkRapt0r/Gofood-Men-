
'use client';

import { useState, useEffect, useRef } from 'react';
import { QRCode } from 'react-qrcode-logo';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

interface QRCodeCardProps {
    slug: string;
    restaurantName: string;
    logoUrl?: string;
    tenantId: string;
    isLocked?: boolean;
}

export default function QRCodeCard({ slug, logoUrl, tenantId, isLocked }: QRCodeCardProps) {
    const [isOpen, setIsOpen] = useState(false);

    // QR State
    const [qrColor, setQrColor] = useState('#000000');
    const [bgColor, setBgColor] = useState('#ffffff');
    const [includeLogo, setIncludeLogo] = useState(true);
    const [logoWidth, setLogoWidth] = useState<number>(60);
    const [logoHeight, setLogoHeight] = useState<number>(60);
    const [logoPadding, setLogoPadding] = useState<number>(5);
    const [logoDataUrl, setLogoDataUrl] = useState<string | undefined>(undefined);

    // UI State
    // UI State
    const [saving, setSaving] = useState(false);

    const [fullUrl, setFullUrl] = useState(`https://gofood.it/${slug}`);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setFullUrl(`${window.location.origin}/${slug}`);
        }
    }, [slug]);

    // Load saved settings
    useEffect(() => {
        const loadSettings = async () => {
            if (!tenantId) return;
            try {
                const supabase = createClient();
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const { data } = await (supabase.from('tenant_design_settings') as any)
                    .select('theme_config')
                    .eq('tenant_id', tenantId)
                    .single();

                if (data?.theme_config?.qrCode) {
                    const config = data.theme_config.qrCode;
                    if (config.qrColor) setQrColor(config.qrColor);
                    if (config.bgColor) setBgColor(config.bgColor);
                    if (config.includeLogo !== undefined) setIncludeLogo(config.includeLogo);
                    if (config.logoWidth) setLogoWidth(config.logoWidth);
                    if (config.logoHeight) setLogoHeight(config.logoHeight);
                    if (config.logoPadding) setLogoPadding(config.logoPadding);
                }
            } catch (error: unknown) {
                console.error('Error loading QR settings:', JSON.stringify(error, null, 2));
            }
        };

        if (tenantId) {
            loadSettings();
        }
    }, [tenantId]);

    const saveSettings = async () => {
        if (!tenantId) {
            console.error('Save failed: Missing tenantId');
            toast.error('Errore: Impossibile salvare, ID ristorante mancante. Riprova a ricaricare la pagina.');
            return;
        }

        setSaving(true);
        try {
            const supabase = createClient();

            // First get existing config to merge
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: existingData } = await (supabase.from('tenant_design_settings') as any)
                .select('theme_config')
                .eq('tenant_id', tenantId)
                .single();

            const currentConfig = existingData?.theme_config || {};

            const newConfig = {
                ...currentConfig,
                qrCode: {
                    qrColor,
                    bgColor,
                    includeLogo,
                    logoWidth,
                    logoHeight,
                    logoPadding
                }
            };

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error } = await (supabase.from('tenant_design_settings') as any)
                .upsert({
                    tenant_id: tenantId,
                    theme_config: newConfig,
                    updated_at: new Date().toISOString()
                });

            if (error) {
                console.error('Supabase error:', JSON.stringify(error, null, 2));
                throw error;
            }

            toast.success('Impostazioni salvate con successo!');
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto';
            console.error('Error saving settings details:', error);
            toast.error('Errore durante il salvataggio: ' + errorMessage);
        } finally {
            setSaving(false);
        }
    };


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
                    setLogoDataUrl(reader.result as string);
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
                onClick={() => !isLocked && setIsOpen(true)}
                className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center justify-center text-center relative overflow-hidden ${isLocked ? 'opacity-80' : 'cursor-pointer hover:shadow-md transition-shadow group'}`}
            >
                {isLocked && (
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
                        value={fullUrl}
                        size={120}
                        bgColor={bgColor}
                        fgColor={qrColor}
                        logoImage={activeLogo}
                        logoWidth={logoWidth * (120 / 280)}
                        logoHeight={logoHeight * (120 / 280)}
                        logoOpacity={1}
                        logoPadding={logoPadding * (120 / 280)}
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
                        className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col md:flex-row"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Left: Controls */}
                        <div className="flex-1 p-6 md:p-8 space-y-6 border-b md:border-b-0 md:border-r border-gray-100 overflow-y-auto">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Personalizza QR</h2>
                                <p className="text-gray-500 text-sm">Crea il QR code perfetto per il tuo brand</p>
                            </div>

                            {/* Colors */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Colori</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Colore QR</label>
                                        <input
                                            type="color"
                                            value={qrColor}
                                            onChange={(e) => setQrColor(e.target.value)}
                                            className="h-10 w-full rounded cursor-pointer border-0 p-0"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Sfondo</label>
                                        <input
                                            type="color"
                                            value={bgColor}
                                            onChange={(e) => setBgColor(e.target.value)}
                                            className="h-10 w-full rounded cursor-pointer border-0 p-0"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Logo Settings */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Logo</h3>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" checked={includeLogo} onChange={(e) => setIncludeLogo(e.target.checked)} className="sr-only peer" />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                    </label>
                                </div>

                                {includeLogo && (
                                    <div className="space-y-4">
                                        {/* Restricted Upload Notice */}
                                        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-start gap-3">
                                            <div className="text-blue-500 mt-0.5">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            </div>
                                            <div>
                                                <p className="text-sm text-blue-800 font-semibold">Gestione Logo</p>
                                                <p className="text-xs text-blue-600 mt-1">
                                                    Il logo utilizzato è quello impostato nel Design Studio.
                                                    Per cambiarlo, modifica le impostazioni del brand.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">Larghezza ({logoWidth}px)</label>
                                                <input
                                                    type="range"
                                                    min="20"
                                                    max="150"
                                                    value={logoWidth}
                                                    onChange={(e) => setLogoWidth(Number(e.target.value))}
                                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">Altezza ({logoHeight}px)</label>
                                                <input
                                                    type="range"
                                                    min="20"
                                                    max="150"
                                                    value={logoHeight}
                                                    onChange={(e) => setLogoHeight(Number(e.target.value))}
                                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <label className="block text-xs font-medium text-gray-500 mb-1">Spaziatura ({logoPadding}px)</label>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="20"
                                                    value={logoPadding}
                                                    onChange={(e) => setLogoPadding(Number(e.target.value))}
                                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="pt-4 mt-auto flex flex-col gap-3">
                                <button
                                    onClick={saveSettings}
                                    disabled={saving || !tenantId}
                                    className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-purple-700 transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {!tenantId ? 'Ristorante non trovato (Ricarica)' : saving ? 'Salvataggio...' : 'Salva Impostazioni'}
                                </button>
                                <button
                                    onClick={downloadQRCode}
                                    className="w-full py-3 bg-white text-gray-900 border-2 border-gray-200 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                    Scarica PNG
                                </button>
                            </div>

                        </div>

                        {/* Right: Preview */}
                        <div className="flex-1 bg-gray-50 p-6 md:p-8 flex flex-col items-center justify-center border-l border-gray-100 relative">
                            <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>

                            <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
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
                            <div className="mt-6 text-center space-y-2">
                                <p className="text-sm font-medium text-gray-500">Anteprima in tempo reale</p>
                                <p className="text-xs text-gray-400">{fullUrl}</p>
                                {(logoWidth > 90 || logoHeight > 90) && (
                                    <div className="flex items-center justify-center gap-2 text-amber-600 text-xs font-bold bg-amber-50 py-2 px-3 rounded-lg border border-amber-200">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                        Attenzione: se il logo è troppo grande il QR potrebbe non funzionare.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
