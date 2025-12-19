'use client';

import React, { useRef, useState } from 'react';
import { useTheme } from './ThemeContext';
import { FrameStyle, DividerStyle } from '@/lib/theme-engine/types';
import toast from 'react-hot-toast';
import { createClient } from '@/lib/supabase/client';
import { ChevronsUpDown, ChevronDown } from 'lucide-react';

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";

interface VisualEditorPanelProps {
    logoUrl?: string | null;
    slug?: string; // Optional now
    restaurantName: string; // Required
    tenantId?: string; // Optional for uniqueness
    onLogoChange?: (url: string) => void;
}

const FONT_OPTIONS = [
    { label: 'Inter (Moderno)', value: 'Inter' },
    { label: 'Playfair Display (Elegante)', value: 'Playfair Display' },
    { label: 'Lato (Pulito)', value: 'Lato' },
    { label: 'Roboto (Neutro)', value: 'Roboto' },
    { label: 'Open Sans (Leggibile)', value: 'Open Sans' },
    { label: 'Montserrat (Geometrico)', value: 'Montserrat' },
    { label: 'Oswald (Forte)', value: 'Oswald' },
    { label: 'Merriweather (Classico)', value: 'Merriweather' },
    { label: 'Lobster (Corsivo)', value: 'Lobster' },
    { label: 'Dancing Script (Artistico)', value: 'Dancing Script' },
    { label: 'Cinzel (Lussuoso)', value: 'Cinzel' },
    { label: 'Space Mono (Tecnico)', value: 'Space Mono' },
];

export function VisualEditorPanel({ logoUrl, slug, restaurantName, tenantId, onLogoChange }: VisualEditorPanelProps) {
    const { currentTheme, updateTheme, applyPreset, presets } = useTheme();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);

    // State for collapsibles
    const [isOpenBrand, setIsOpenBrand] = useState(true);
    const [isOpenSurface, setIsOpenSurface] = useState(false);
    const [isOpenTypography, setIsOpenTypography] = useState(false);
    const [isOpenStyle, setIsOpenStyle] = useState(false);


    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !onLogoChange) return;

        if (file.size > 2 * 1024 * 1024) {
            toast.error('Il logo deve essere inferiore a 2MB');
            return;
        }

        try {
            if (!restaurantName) {
                toast.error('Inserisci prima il nome del ristorante');
                return;
            }

            // Generate safe folder name from restaurant name
            const baseName = restaurantName
                .toLowerCase()
                .normalize('NFD') // Split accents
                .replace(/[\u0300-\u036f]/g, '') // Remove accents
                .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
                .replace(/^-+|-+$/g, '') // Trim hyphens
                || 'temp-uploads'; // Fallback

            // Append short ID to ensure uniqueness
            // If tenantId is missing (e.g. very fresh state), fallback to timestamp
            const uniqueSuffix = tenantId ? `-${tenantId}` : `-${Date.now().toString().slice(-6)}`;
            const sanitizedFolderName = `${baseName}${uniqueSuffix}`;

            setUploading(true);
            const supabase = createClient();

            // 1. Clean up old logos to save space
            // Since the folder is unique to this tenant, we can safely clear it.
            const { data: existingFiles } = await supabase.storage
                .from('logos')
                .list(sanitizedFolderName);

            if (existingFiles && existingFiles.length > 0) {
                const filesToRemove = existingFiles.map(x => `${sanitizedFolderName}/${x.name}`);
                await supabase.storage
                    .from('logos')
                    .remove(filesToRemove);
            }

            // Generate clean filename
            const fileExt = file.name.split('.').pop();
            const fileName = `logo-${Date.now()}.${fileExt}`;
            const filePath = `${sanitizedFolderName}/${fileName}`;

            // 2. Upload to Supabase Storage ('logos' bucket)
            const { error: uploadError } = await supabase.storage
                .from('logos')
                .upload(filePath, file, {
                    upsert: true
                });

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from('logos')
                .getPublicUrl(filePath);

            onLogoChange(data.publicUrl);
            toast.success('Logo caricato con successo!');
        } catch (error) {
            console.error('Error uploading logo:', error);
            toast.error('Errore durante il caricamento del logo');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="w-full bg-white border-r border-gray-200 flex-1 min-h-0 overflow-y-auto p-6 shadow-xl flex flex-col">


            <div className="flex-1 space-y-10">

                {/* 0. LOGO */}
                {onLogoChange && (
                    <div>
                        <h3 className="section-title">Logo Ristorante</h3>
                        <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <div
                                className="w-16 h-16 bg-white rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden shrink-0 cursor-pointer hover:border-orange-500 transition-colors"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {logoUrl ? (
                                    /* eslint-disable-next-line @next/next/no-img-element */
                                    <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
                                ) : (
                                    <span className="text-2xl text-gray-300">+</span>
                                )}
                            </div>
                            <div className="flex-1">
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="text-xs font-bold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-lg transition-colors"
                                >
                                    {uploading ? 'Caricamento...' : (logoUrl ? 'Cambia Logo' : 'Carica Logo')}
                                </button>
                                <p className="text-[10px] text-gray-400 mt-1">Max 2MB (PNG, JPG)</p>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                            </div>
                        </div>

                        {/* Header Layout */}
                        <div className="mt-4">
                            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Allineamento Intestazione</label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => updateTheme({ mobileHeaderStyle: 'left' })}
                                    className={`p-2 rounded-lg border text-xs flex flex-col items-center gap-2 transition-all ${(currentTheme.mobileHeaderStyle || 'left') === 'left'
                                        ? 'border-orange-500 bg-orange-50 text-orange-700 ring-1 ring-orange-500 font-medium'
                                        : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                                        }`}
                                >
                                    <div className="flex w-full items-center justify-start gap-2 px-2 opacity-60">
                                        <div className="w-8 h-2 bg-current rounded-sm"></div>
                                        <div className="w-16 h-2 bg-gray-200 rounded-sm"></div>
                                    </div>
                                    A Sinistra
                                </button>
                                <button
                                    type="button"
                                    onClick={() => updateTheme({ mobileHeaderStyle: 'center' })}
                                    className={`p-2 rounded-lg border text-xs flex flex-col items-center gap-2 transition-all ${currentTheme.mobileHeaderStyle === 'center'
                                        ? 'border-orange-500 bg-orange-50 text-orange-700 ring-1 ring-orange-500 font-medium'
                                        : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                                        }`}
                                >
                                    <div className="flex w-full items-center justify-center gap-2 px-2 opacity-60">
                                        <div className="w-8 h-2 bg-current rounded-sm"></div>
                                    </div>
                                    Centrato
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <hr className="border-gray-100" />

                {/* 1. PRESETS */}
                <div>
                    <h3 className="section-title">Stili Pronti</h3>
                    <select
                        onChange={(e) => {
                            if (e.target.value) {
                                applyPreset(e.target.value);
                            }
                        }}
                        className="styled-select"
                        value={currentTheme.id || ''}
                    >
                        <option value="" disabled>Seleziona uno stile...</option>
                        {presets.map((preset) => (
                            <option key={preset.id} value={preset.id}>
                                {preset.name} {preset.id === currentTheme.id ? '(Attivo)' : ''}
                            </option>
                        ))}
                    </select>
                </div>

                <hr className="border-gray-100" />

                {/* 2. COLORS & IDENTITY */}
                <div>
                    <h3 className="section-title mb-4">Colori & Identità</h3>

                    <div className="space-y-4">
                        {/* Brand Principal - Collapsible */}
                        <Collapsible
                            open={isOpenBrand}
                            onOpenChange={setIsOpenBrand}
                            className="w-full space-y-2"
                        >
                            <CollapsibleTrigger asChild>
                                <Button variant="ghost" className="flex w-full justify-between p-2 font-semibold hover:bg-muted/50 rounded-lg group">
                                    <span className="text-xs uppercase tracking-wider text-gray-500 group-hover:text-gray-900">Brand Principal</span>
                                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpenBrand ? "" : "-rotate-90"}`} />
                                </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <div className="bg-gray-50 p-4 rounded-xl space-y-4 mt-2">
                                    <div className="grid grid-cols-1 gap-4">
                                        <ColorPicker
                                            label="Principale"
                                            description="Titoli categorie e pulsanti"
                                            value={currentTheme.colors.primary}
                                            onChange={(val) => updateTheme({ colors: { ...currentTheme.colors, primary: val } })}
                                        />
                                        <ColorPicker
                                            label="Secondario"
                                            description="Dettagli e decorazioni"
                                            value={currentTheme.colors.secondary}
                                            onChange={(val) => updateTheme({ colors: { ...currentTheme.colors, secondary: val } })}
                                        />
                                        <ColorPicker
                                            label="Accento"
                                            description="Allergeni e info"
                                            value={currentTheme.colors.accent}
                                            onChange={(val) => updateTheme({ colors: { ...currentTheme.colors, accent: val } })}
                                        />
                                    </div>
                                </div>
                            </CollapsibleContent>
                        </Collapsible>

                        {/* Surfaces & Borders - Collapsible */}
                        <Collapsible
                            open={isOpenSurface}
                            onOpenChange={setIsOpenSurface}
                            className="w-full space-y-2"
                        >
                            <CollapsibleTrigger asChild>
                                <Button variant="ghost" className="flex w-full justify-between p-2 font-semibold hover:bg-muted/50 rounded-lg group">
                                    <span className="text-xs uppercase tracking-wider text-gray-500 group-hover:text-gray-900">Superfici & Bordi</span>
                                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpenSurface ? "" : "-rotate-90"}`} />
                                </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <div className="bg-gray-50 p-4 rounded-xl space-y-4 mt-2">
                                    <ColorPicker
                                        label="Sfondo Menu"
                                        description="Colore di fondo generale"
                                        value={currentTheme.colors.background}
                                        onChange={(val) => updateTheme({ colors: { ...currentTheme.colors, background: val } })}
                                    />
                                    <ColorPicker
                                        label="Superficie Piatti"
                                        description="Sfondo delle card dei piatti"
                                        value={currentTheme.colors.surface}
                                        onChange={(val) => updateTheme({ colors: { ...currentTheme.colors, surface: val } })}
                                    />
                                    <ColorPicker
                                        label="Divisori & Cornici"
                                        description="Linee di separazione"
                                        value={currentTheme.colors.border || '#e5e7eb'}
                                        onChange={(val) => updateTheme({ colors: { ...currentTheme.colors, border: val } })}
                                    />
                                </div>
                            </CollapsibleContent>
                        </Collapsible>

                        {/* Typography - Collapsible */}
                        <Collapsible
                            open={isOpenTypography}
                            onOpenChange={setIsOpenTypography}
                            className="w-full space-y-2"
                        >
                            <CollapsibleTrigger asChild>
                                <Button variant="ghost" className="flex w-full justify-between p-2 font-semibold hover:bg-muted/50 rounded-lg group">
                                    <span className="text-xs uppercase tracking-wider text-gray-500 group-hover:text-gray-900">Tipografia</span>
                                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpenTypography ? "" : "-rotate-90"}`} />
                                </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <div className="bg-gray-50 p-4 rounded-xl space-y-4 mt-2">
                                    <ColorPicker
                                        label="Titoli Piatti"
                                        description="Colore nome del piatto"
                                        value={currentTheme.colors.text}
                                        onChange={(val) => updateTheme({ colors: { ...currentTheme.colors, text: val } })}
                                    />
                                    <ColorPicker
                                        label="Descrizioni"
                                        description="Ingredienti e dettagli"
                                        value={currentTheme.colors.textSecondary || '#6b7280'}
                                        onChange={(val) => updateTheme({ colors: { ...currentTheme.colors, textSecondary: val } })}
                                    />
                                    <ColorPicker
                                        label="Prezzi"
                                        description="Evidenza del prezzo"
                                        value={currentTheme.colors.price || '#000000'}
                                        onChange={(val) => updateTheme({ colors: { ...currentTheme.colors, price: val } })}
                                    />
                                </div>
                            </CollapsibleContent>
                        </Collapsible>

                        {/* Style & Finishes - Collapsible (Merged here as per user request to be part of the flow) */}
                        <Collapsible
                            open={isOpenStyle}
                            onOpenChange={setIsOpenStyle}
                            className="w-full space-y-2 border-t pt-4"
                        >
                            <CollapsibleTrigger asChild>
                                <Button variant="ghost" className="flex w-full justify-between p-2 font-semibold hover:bg-muted/50 rounded-lg group">
                                    <span className="text-xs font-bold font-display uppercase tracking-wider text-gray-900 group-hover:text-orange-600">Stile & Finiture (Avanzato)</span>
                                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpenStyle ? "" : "-rotate-90"}`} />
                                </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <div className="space-y-6 mt-4 pl-2">
                                    {/* Fonts */}
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Font Titoli (Intestazioni)</label>
                                            <select
                                                value={currentTheme.fontHeading}
                                                onChange={(e) => updateTheme({ fontHeading: e.target.value })}
                                                className="styled-select"
                                                style={{ fontFamily: currentTheme.fontHeading }}
                                            >
                                                {FONT_OPTIONS.map(f => (
                                                    <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>{f.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Font Testo (Corpo)</label>
                                            <select
                                                value={currentTheme.fontBody}
                                                onChange={(e) => updateTheme({ fontBody: e.target.value })}
                                                className="styled-select"
                                                style={{ fontFamily: currentTheme.fontBody }}
                                            >
                                                {FONT_OPTIONS.map(f => (
                                                    <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>{f.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Frame */}
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Cornice Esterna</label>
                                        <select
                                            value={currentTheme.frame}
                                            onChange={(e) => updateTheme({ frame: e.target.value as FrameStyle })}
                                            className="styled-select"
                                        >
                                            <option value="none">Nessuna</option>
                                            <option value="simple">Semplice</option>
                                            <option value="double">Doppia Linea</option>
                                            <option value="elegant">Elegante</option>
                                            <option value="wooden">Legno Rustico</option>
                                            <option value="gold-leaf">Fogliolina Oro</option>
                                            <option value="minimal">Minimal</option>
                                        </select>
                                    </div>

                                    {/* Dividers */}
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Stile Divisori</label>
                                        <select
                                            value={currentTheme.dividerStyle || 'solid'}
                                            onChange={(e) => updateTheme({ dividerStyle: e.target.value as DividerStyle })}
                                            className="styled-select"
                                        >
                                            <option value="solid">Linea Solida</option>
                                            <option value="dashed">Tratteggiata</option>
                                            <option value="dotted">Puntini</option>
                                            <option value="double">Doppia Linea</option>
                                            <option value="groove">Incisa</option>
                                            <option value="wavy">Ondulata (Wavy)</option>
                                            <option value="slash">Obliquo (Street)</option>
                                            <option value="filigree">Ornamentale</option>
                                        </select>
                                    </div>
                                </div>
                            </CollapsibleContent>
                        </Collapsible>
                    </div>
                </div>

                <div className="h-20"></div> {/* Spacer */}
            </div>

            <style jsx>{`
                .section-title {
                    font-size: 0.75rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: #9CA3AF;
                    margin-bottom: 0.75rem;
                }
                .styled-select {
                    width: 100%;
                    padding: 0.625rem;
                    background-color: #F9FAFB;
                    border: 1px solid #E5E7EB;
                    border-radius: 0.5rem;
                    font-size: 0.875rem;
                    color: #1F2937;
                    appearance: none;
                    background-position: right 0.5rem center;
                    background-repeat: no-repeat;
                    background-size: 1.5em 1.5em;
                }
                .styled-select:focus {
                    outline: 2px solid #F97316;
                    border-color: transparent;
                }
            `}</style>
        </div>
    );
}

// Enhanced Color Picker Helper
function ColorPicker({ label, description, value, onChange }: { label: string, description?: string, value: string, onChange: (val: string) => void }) {
    // Ensure value is a string to prevent controlled/uncontrolled errors
    const safeValue = value || '#000000';

    return (
        <div className="flex items-center justify-between group w-full">
            <div className="flex flex-col">
                <label className="text-sm text-gray-700 font-medium group-hover:text-gray-900 transition-colors">
                    {label}
                </label>
                {description && (
                    <span className="text-[10px] text-gray-400">{description}</span>
                )}
            </div>
            <div className="flex items-center gap-3">
                <div className="relative w-9 h-9 rounded-full ring-2 ring-gray-100 shadow-sm overflow-hidden cursor-pointer hover:scale-105 transition-transform" style={{ backgroundColor: safeValue }}>
                    <input
                        type="color"
                        value={safeValue}
                        onChange={(e) => onChange(e.target.value)}
                        className="absolute inset-0 w-[150%] h-[150%] -top-[25%] -left-[25%] opacity-0 cursor-pointer"
                    />
                </div>
                <input
                    type="text"
                    value={safeValue}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-16 text-[10px] font-mono border border-gray-200 rounded py-1 px-1 text-center uppercase text-gray-500 focus:text-gray-900 focus:border-orange-500 focus:outline-none"
                    maxLength={7}
                />
            </div>
        </div>
    );
}
