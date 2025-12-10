'use client';

import React, { useRef, useState } from 'react';
import { useTheme } from './ThemeContext';
import { FrameStyle, DividerStyle } from '@/lib/theme-engine/types';
import toast from 'react-hot-toast';
import { createClient } from '@/lib/supabase/client';

interface VisualEditorPanelProps {
    logoUrl?: string | null;
    slug: string;
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

export function VisualEditorPanel({ logoUrl, slug, onLogoChange }: VisualEditorPanelProps) {
    const { currentTheme, updateTheme, applyPreset, presets } = useTheme();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !onLogoChange) return;

        if (file.size > 2 * 1024 * 1024) {
            toast.error('Il logo deve essere inferiore a 2MB');
            return;
        }

        try {
            setUploading(true);
            const supabase = createClient();

            // Generate clean filename
            const fileExt = file.name.split('.').pop();
            const fileName = `logo-${Date.now()}.${fileExt}`;
            const filePath = `${slug}/${fileName}`;

            // 1. Clean up old logos for this slug (to save space)
            const { data: existingFiles } = await supabase.storage
                .from('logos')
                .list(slug);

            if (existingFiles && existingFiles.length > 0) {
                const filesToRemove = existingFiles.map(f => `${slug}/${f.name}`);
                await supabase.storage
                    .from('logos')
                    .remove(filesToRemove);
            }

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
        <div className="w-96 bg-white border-r border-gray-200 h-screen overflow-y-auto p-6 shadow-xl z-50 flex flex-col">
            <h2 className="text-2xl font-bold font-display text-gray-900 mb-6 shrink-0">Design Studio 🎨</h2>

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

                        {logoUrl && (
                            <div className="mt-4 px-1">
                                <label className="text-xs font-semibold text-gray-500 mb-2 block">Layout Mobile</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => updateTheme({ mobileHeaderStyle: 'left' })}
                                        className={`p-2 rounded border text-xs flex flex-col items-center gap-1 transition-all ${(currentTheme.mobileHeaderStyle || 'left') === 'left'
                                                ? 'border-orange-500 bg-orange-50 text-orange-700 ring-1 ring-orange-500'
                                                : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                                            }`}
                                    >
                                        <div className="flex w-full items-center justify-between px-1 mb-1 opacity-50">
                                            <div className="w-4 h-3 bg-current rounded-sm"></div>
                                            <div className="flex gap-1">
                                                <div className="w-1 h-3 bg-current rounded-sm"></div>
                                                <div className="w-1 h-3 bg-current rounded-sm"></div>
                                            </div>
                                        </div>
                                        A Sinistra
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => updateTheme({ mobileHeaderStyle: 'center' })}
                                        className={`p-2 rounded border text-xs flex flex-col items-center gap-1 transition-all ${currentTheme.mobileHeaderStyle === 'center'
                                                ? 'border-orange-500 bg-orange-50 text-orange-700 ring-1 ring-orange-500'
                                                : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                                            }`}
                                    >
                                        <div className="flex w-full items-center justify-between px-1 mb-1 opacity-50">
                                            <div className="w-1 h-3 bg-current rounded-sm"></div>
                                            <div className="w-4 h-3 bg-current rounded-sm"></div>
                                            <div className="w-1 h-3 bg-current rounded-sm"></div>
                                        </div>
                                        Centrato
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <hr className="border-gray-100" />

                {/* 1. PRESETS */}
                <div>
                    <h3 className="section-title">Stili Pronti</h3>
                    <div className="grid grid-cols-2 gap-2">
                        {presets.map((preset) => (
                            <button
                                key={preset.id}
                                type="button"
                                onClick={() => applyPreset(preset.id)}
                                className={`text-left px-3 py-2 rounded-lg border text-xs transition-all ${currentTheme.id === preset.id
                                    ? 'border-orange-500 bg-orange-50 text-orange-700 ring-1 ring-orange-500 font-bold'
                                    : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                                    }`}
                            >
                                {preset.name}
                            </button>
                        ))}
                    </div>
                </div>

                <hr className="border-gray-100" />

                {/* 2. COLORS */}
                <div>
                    <h3 className="section-title mb-4">Colori & Identità</h3>

                    <div className="space-y-6">
                        {/* Brand */}
                        <div className="bg-gray-50 p-4 rounded-xl space-y-4">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Brand Principal</span>
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

                        {/* Surface */}
                        <div className="bg-gray-50 p-4 rounded-xl space-y-4">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Superfici & Bordi</span>
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

                        {/* Typography */}
                        <div className="bg-gray-50 p-4 rounded-xl space-y-4">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tipografia</span>
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
                    </div>
                </div>

                <hr className="border-gray-100" />

                {/* 3. TYPOGRAPHY & STYLE */}
                <div>
                    <h3 className="section-title mb-4">Stile & Finiture</h3>
                    <div className="space-y-6">

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
