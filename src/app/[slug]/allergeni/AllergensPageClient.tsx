'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AllergensList from '@/components/AllergensList';
import AllergensLegal from '@/components/AllergensLegal';
import { useTranslation } from '@/hooks/useTranslation';
import allergensData from '@/data/allergens.json';
import { AllergenData, Tenant } from '@/types/menu';
import { ThemeProvider } from '@/components/theme/ThemeContext';
import { ThemeWrapper } from '@/components/theme/ThemeWrapper';
import { ThemeConfig } from '@/lib/theme-engine/types';

type TabType = 'list' | 'legal';

interface AllergensPageClientProps {
    tenant: Tenant;
    initialTheme?: ThemeConfig;
}

export default function AllergensPageClient({ tenant, initialTheme }: AllergensPageClientProps) {
    const { language } = useTranslation();
    const [activeTab, setActiveTab] = useState<TabType>('list');
    const data = allergensData as AllergenData;

    return (
        <ThemeProvider initialTheme={initialTheme}>
            <ThemeWrapper className="min-h-screen flex flex-col font-sans transition-colors duration-300">
                <Header restaurantName={tenant.restaurant_name} logoUrl={tenant.logo_url || undefined} />

                <main className="flex-1 container mx-auto px-4 pb-8 pt-[88px] max-w-7xl">
                    {/* Breadcrumb */}
                    <nav className="mb-6" aria-label="Breadcrumb">
                        <ol className="flex items-center gap-2 text-sm text-[var(--tenant-text-secondary,#4B5563)]">
                            <li>
                                <Link
                                    href={`/${tenant.slug}`}
                                    className="hover:text-[var(--tenant-primary,#8B0000)] transition-colors flex items-center gap-1"
                                >
                                    <span>🏠</span>
                                    {language === 'it' ? 'Menu' : 'Menu'}
                                </Link>
                            </li>
                            <li className="text-gray-400">/</li>
                            <li className="text-[var(--tenant-primary,#8B0000)] font-medium">
                                {language === 'it' ? 'Allergeni' : 'Allergens'}
                            </li>
                        </ol>
                    </nav>

                    {/* Hero Section */}
                    <section className="text-center mb-8 md:mb-12">
                        <div className="inline-block mb-4">
                            <span className="text-5xl md:text-6xl">🛡️</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-serif font-bold text-[var(--tenant-primary,#8B0000)] mb-4 leading-tight">
                            {language === 'it' ? 'Allergeni e Intolleranze' : 'Allergens and Intolerances'}
                        </h1>
                        <p className="text-base md:text-lg text-[var(--tenant-text-secondary,#4B5563)] max-w-3xl mx-auto leading-relaxed px-4">
                            {language === 'it'
                                ? 'La tua sicurezza è la nostra priorità. Consulta l\'elenco completo degli allergeni presenti nei nostri piatti.'
                                : 'Your safety is our priority. Check the complete list of allergens present in our dishes.'}
                        </p>
                    </section>

                    {/* Tabs Navigation */}
                    <div className="flex justify-center mb-8">
                        <div className="inline-flex rounded-lg bg-[var(--tenant-surface,#FFFFFF)] shadow-md border border-gray-200 p-1">
                            <button
                                onClick={() => setActiveTab('list')}
                                className={`px-6 py-3 rounded-md text-sm md:text-base font-medium transition-all ${activeTab === 'list'
                                    ? 'bg-[var(--tenant-primary,#8B0000)] text-white shadow-lg'
                                    : 'text-[var(--tenant-text,#171717)] hover:bg-gray-100'
                                    }`}
                            >
                                {language === 'it' ? '📋 Lista Allergeni' : '📋 Allergen List'}
                            </button>
                            <button
                                onClick={() => setActiveTab('legal')}
                                className={`px-6 py-3 rounded-md text-sm md:text-base font-medium transition-all ${activeTab === 'legal'
                                    ? 'bg-[var(--tenant-primary,#8B0000)] text-white shadow-lg'
                                    : 'text-[var(--tenant-text,#171717)] hover:bg-gray-100'
                                    }`}
                            >
                                {language === 'it' ? '📄 Info Legali' : '📄 Legal Info'}
                            </button>
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="mb-12">
                        {activeTab === 'list' ? (
                            <div className="animate-fadeIn">
                                <div className="text-center mb-6">
                                    <h2 className="text-2xl md:text-3xl font-serif font-bold text-[var(--tenant-text,#171717)] mb-2">
                                        {language === 'it' ? '14 Allergeni Principali' : '14 Main Allergens'}
                                    </h2>
                                    <p className="text-sm md:text-base text-[var(--tenant-text-secondary,#4B5563)]">
                                        {language === 'it'
                                            ? 'Secondo il Regolamento (UE) N. 1169/2011'
                                            : 'According to Regulation (EU) No 1169/2011'}
                                    </p>
                                </div>
                                <AllergensList allergens={data.allergens} />
                            </div>
                        ) : (
                            <div className="animate-fadeIn">
                                <AllergensLegal data={data} logoUrl={tenant.logo_url || undefined} coverChargeValue={tenant.cover_charge} />
                            </div>
                        )}
                    </div>

                    {/* Info Box */}
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-gradient-to-r from-[var(--tenant-primary,#8B0000)] to-[var(--tenant-primary,#8B0000)] rounded-2xl p-6 md:p-8 text-white shadow-xl">
                            <div className="flex items-start gap-4">
                                <span className="text-3xl md:text-4xl flex-shrink-0">💬</span>
                                <div>
                                    <h3 className="text-xl md:text-2xl font-bold mb-2">
                                        {language === 'it' ? 'Hai domande?' : 'Have questions?'}
                                    </h3>
                                    <p className="text-sm md:text-base text-white/90 leading-relaxed">
                                        {language === 'it'
                                            ? 'Il nostro personale è a tua disposizione per fornirti informazioni dettagliate sugli ingredienti di ogni piatto e per aiutarti a scegliere in base alle tue esigenze alimentari.'
                                            : 'Our staff is at your disposal to provide you with detailed information about the ingredients of each dish and to help you choose according to your dietary needs.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                <Footer
                    footerData={tenant.footer_data}
                    restaurantName={tenant.restaurant_name}
                    logoUrl={tenant.logo_url || undefined}
                />
            </ThemeWrapper>
        </ThemeProvider>
    );
}
