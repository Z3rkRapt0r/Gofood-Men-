'use client';

import { useState, useEffect } from 'react';
import { FooterData, FooterLocation, FooterSocial } from '@/types/menu';
import { SocialIcon } from '../SocialIcon';

interface FooterConfiguratorProps {
    formData: {
        contact_email: string;
        footer_data?: FooterData;
    };
    onUpdate: (updates: Partial<any>) => void;
    onNext: () => void;
    onBack: () => void;
}

const SOCIAL_PLATFORMS = [
    { id: 'facebook', label: 'Facebook', icon: '📘' },
    { id: 'instagram', label: 'Instagram', icon: '📸' },
    { id: 'website', label: 'Sito Web', icon: '🌐' },
    { id: 'other', label: 'Altro Link', icon: '🔗' },
] as const;

export default function FooterConfigurator({ formData, onUpdate, onNext, onBack }: FooterConfiguratorProps) {
    // Local state for complex structures
    const [locations, setLocations] = useState<FooterLocation[]>(
        formData.footer_data?.locations && formData.footer_data.locations.length > 0
            ? formData.footer_data.locations
            : [{ city: '', address: '', phone: '', opening_hours: '' }]
    );

    const [socials, setSocials] = useState<FooterSocial[]>(
        formData.footer_data?.socials || []
    );

    // Helper to update state and notify parent
    const updateFooterData = (newLocations: FooterLocation[], newSocials: FooterSocial[]) => {
        const footerData: FooterData = {
            locations: newLocations,
            socials: newSocials,
            links: formData.footer_data?.links || [],
            show_brand_column: true,
            brand_description: formData.footer_data?.brand_description
        };
        onUpdate({ footer_data: footerData });
    };

    const handleAddLocation = () => {
        const newLocations = [...locations, { city: '', address: '', phone: '', opening_hours: '' }];
        setLocations(newLocations);
        updateFooterData(newLocations, socials);
    };

    const handleRemoveLocation = (index: number) => {
        const newLocations = locations.filter((_, i) => i !== index);
        setLocations(newLocations);
        updateFooterData(newLocations, socials);
    };

    const handleLocationChange = (index: number, field: keyof FooterLocation, value: string) => {
        const newLocations = [...locations];
        newLocations[index] = { ...newLocations[index], [field]: value };
        setLocations(newLocations);
        updateFooterData(newLocations, socials);
    };

    const handleSocialChange = (platform: FooterSocial['platform'], url: string) => {
        let newSocials = [...socials];
        if (!url) {
            // Remove if empty
            newSocials = newSocials.filter(s => s.platform !== platform);
        } else {
            const existingIndex = newSocials.findIndex(s => s.platform === platform);
            if (existingIndex >= 0) {
                newSocials[existingIndex] = { ...newSocials[existingIndex], url };
            } else {
                newSocials.push({ platform, url });
            }
        }
        setSocials(newSocials);
        updateFooterData(locations, newSocials);
    };

    // Derived state for button validation
    const isValid = formData.contact_email && locations.length > 0 && locations[0].city && locations[0].address;

    return (
        <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-orange-100 max-h-[80vh] overflow-y-auto">
            <div className="text-center mb-8">
                <h2 className="font-display text-3xl font-bold text-gray-900 mb-4">
                    Contatti & Social
                </h2>
                <p className="text-lg text-gray-600">
                    Dove possono trovarti i tuoi clienti?
                </p>
            </div>

            <div className="max-w-2xl mx-auto space-y-8 mb-8">
                {/* 1. Contatto Principale (Email) */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-2">Contatti Generali</h3>
                    <div>
                        <label htmlFor="contact_email" className="block text-sm font-semibold text-gray-700 mb-2">
                            Email Pubblica *
                        </label>
                        <input
                            type="email"
                            id="contact_email"
                            required
                            value={formData.contact_email}
                            onChange={(e) => onUpdate({ contact_email: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                            placeholder="info@tuoristorante.it"
                        />
                    </div>
                </div>

                {/* 2. Sedi (Locations) */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                        <h3 className="text-lg font-bold text-gray-800">Le Tue Sedi</h3>
                        <button
                            onClick={handleAddLocation}
                            className="text-sm font-semibold text-orange-600 hover:text-orange-700"
                        >
                            + Aggiungi Sede
                        </button>
                    </div>

                    <div className="space-y-6">
                        {locations.map((loc, index) => (
                            <div key={index} className="bg-gray-50 p-4 rounded-xl border border-gray-200 relative animate-in fade-in slide-in-from-bottom-2">
                                {index > 0 && (
                                    <button
                                        onClick={() => handleRemoveLocation(index)}
                                        className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                                        title="Rimuovi sede"
                                    >
                                        ✕
                                    </button>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="col-span-1 md:col-span-2">
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                            {index === 0 ? 'Sede Principale' : `Sede #${index + 1}`}
                                        </h4>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">Città/Zona *</label>
                                        <input
                                            type="text"
                                            value={loc.city}
                                            onChange={(e) => handleLocationChange(index, 'city', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-none"
                                            placeholder="Es. Roma Centro"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">Telefono</label>
                                        <input
                                            type="tel"
                                            value={loc.phone || ''}
                                            onChange={(e) => handleLocationChange(index, 'phone', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-none"
                                            placeholder="+39 ..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">Orari Apertura</label>
                                        <input
                                            type="text"
                                            value={loc.opening_hours || ''}
                                            onChange={(e) => handleLocationChange(index, 'opening_hours', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-none"
                                            placeholder="Lun-Dom: 12-23"
                                        />
                                    </div>
                                    <div className="col-span-1 md:col-span-2">
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">Indirizzo Completo *</label>
                                        <input
                                            type="text"
                                            value={loc.address}
                                            onChange={(e) => handleLocationChange(index, 'address', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-none"
                                            placeholder="Via Roma 123"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 3. Social Media */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-2">Social Network</h3>
                    <div className="grid grid-cols-1 gap-4">
                        {SOCIAL_PLATFORMS.map((platform) => {
                            const activeSocial = socials.find(s => s.platform === platform.id);
                            return (
                                <div key={platform.id} className="flex items-center gap-3">
                                    <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-lg text-gray-600 shrink-0">
                                        <SocialIcon platform={platform.id} className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <input
                                            type="url"
                                            value={activeSocial?.url || ''}
                                            onChange={(e) => handleSocialChange(platform.id as FooterSocial['platform'], e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all placeholder:text-gray-400"
                                            placeholder={`Link al tuo profilo ${platform.label}`}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <p className="text-xs text-gray-500">
                        Inserisci i link completi (es. https://instagram.com/tuonome)
                    </p>
                </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                <button
                    onClick={onBack}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                    ← Indietro
                </button>
                <button
                    onClick={onNext}
                    disabled={!isValid}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02]"
                >
                    Completa Setup →
                </button>
            </div>
        </div>
    );
}
