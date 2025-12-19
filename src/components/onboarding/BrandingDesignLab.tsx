'use client';

import React, { useRef, useState } from 'react';
import { VisualEditorPanel } from '@/components/theme/VisualEditorPanel';
import { ThemeWrapper } from '@/components/theme/ThemeWrapper';
import { useTheme } from '@/components/theme/ThemeContext';
import { ThemeDivider } from '@/components/theme/ThemeDivider';
import Header from '@/components/Header';
import CategoryNav from '@/components/CategoryNav';
import DishCard from '@/components/DishCard';
import Footer from '@/components/Footer';

// Use same MOCK DATA as DesignLab for consistency
const MOCK_CATEGORIES = [
    {
        id: 'antipasti',
        name: 'Antipasti',
        dishes: [
            {
                id: 'd1',
                name: 'Tartare di Tonno',
                description: 'Tonno fresco, avocado, lime e sesamo.',
                price: '18.00',
                image: '/images/dish-placeholder.jpg',
                allergens: ['fish', 'sesame']
            }
        ]
    },
    {
        id: 'primi',
        name: 'Primi Piatti',
        dishes: [
            {
                id: 'd3',
                name: 'Carbonara',
                description: 'Spaghetti, guanciale croccante, pecorino, uovo.',
                price: '14.00',
                image: '/images/dish-placeholder.jpg',
                allergens: ['gluten', 'egg', 'milk']
            }
        ]
    }
];

interface BrandingDesignLabProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    formData: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onUpdate: (updates: any) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onNext: (themeConfig?: any) => void;
    onBack: () => void;
    hideNavigation?: boolean;
    tenantId?: string;
}

export default function BrandingDesignLab({ formData, onUpdate, onNext, onBack, hideNavigation, tenantId }: BrandingDesignLabProps) {
    const { currentTheme } = useTheme();
    const [activeCategory, setActiveCategory] = useState<string>('antipasti');
    const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');
    const mainRef = useRef<HTMLDivElement>(null);

    // Sync theme changes to parent form data
    React.useEffect(() => {
        if (currentTheme) {
            onUpdate({ theme_options: currentTheme });
        }
    }, [currentTheme]);

    const handleCategoryClick = (categoryId: string) => {
        setActiveCategory(categoryId);
    };

    const handleContinue = () => {
        // Prepare updates for the tenant record
        // We sync only the theme options to the new table
        const updates = {
            theme_options: currentTheme
        };

        // Pass updates back to parent (which will handle DB save)
        onUpdate(updates);

        // Trigger next step
        onNext(currentTheme);
    };

    // Construct a mock tenant object that reacts to the theme
    const mockTenant = {
        restaurant_name: formData.restaurant_name || "Il Tuo Ristorante",
        logo_url: formData.logo_url,
        primary_color: currentTheme.colors.primary,
        secondary_color: currentTheme.colors.secondary,
        background_color: currentTheme.colors.background,
        slug: formData.slug || "design-kitchen",
        tagline: "Sperimenta il tuo stile",
        hero_title_color: currentTheme.colors.text === '#ffffff' || currentTheme.colors.background === '#1c1917' ? '#FFFFFF' : currentTheme.colors.primary,
        hero_tagline_color: currentTheme.colors.text === '#ffffff' || currentTheme.colors.background === '#1c1917' ? '#E5E7EB' : currentTheme.colors.secondary,
    };

    return (
        <div className="flex flex-col md:flex-row h-full bg-white font-sans overflow-hidden relative">

            {/* Mobile Tabs */}
            <div className="md:hidden flex h-12 shrink-0 border-b border-gray-200">
                <button
                    onClick={() => setMobileTab('editor')}
                    className={`flex-1 text-sm font-bold transition-colors ${mobileTab === 'editor' ? 'bg-white text-orange-600 border-b-2 border-orange-500' : 'bg-gray-50 text-gray-500'}`}
                >
                    🎨 Editor
                </button>
                <button
                    onClick={() => setMobileTab('preview')}
                    className={`flex-1 text-sm font-bold transition-colors ${mobileTab === 'preview' ? 'bg-white text-orange-600 border-b-2 border-orange-500' : 'bg-gray-50 text-gray-500'}`}
                >
                    📱 Anteprima
                </button>
            </div>

            {/* Left Panel: Editor */}
            <div className={`w-full md:w-96 flex flex-col border-r border-gray-200 md:flex flex-1 min-h-0 ${mobileTab === 'preview' ? 'hidden' : 'flex'}`}>
                <VisualEditorPanel
                    logoUrl={formData.logo_url}
                    slug={formData.slug}
                    restaurantName={formData.restaurant_name}
                    tenantId={tenantId}
                    onLogoChange={(url) => onUpdate({ logo_url: url })}
                />

                {/* Navigation Buttons embedded in the sidebar for better UX */}
                {!hideNavigation && (
                    <div className="p-4 border-t border-gray-200 bg-white flex flex-col gap-3 shrink-0 z-30">
                        <div className="flex items-start gap-2 bg-blue-50 p-2.5 rounded-lg border border-blue-100">
                            <span className="text-sm md:text-base">💡</span>
                            <p className="text-xs text-blue-700 leading-relaxed">
                                Non preoccuparti, potrai modificare il design del tuo menu in qualsiasi momento dalla dashboard.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={onBack}
                                className="px-4 py-3 border border-red-200 text-red-600 rounded-xl font-medium hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                            >
                                <span className="text-lg">🚪</span> Esci
                            </button>
                            <button
                                onClick={handleContinue}
                                className="px-4 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-bold hover:shadow-md hover:scale-[1.02] transition-all"
                            >
                                Continua
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Right Panel: Preview */}
            <div className={`flex-1 flex flex-col h-full overflow-hidden relative bg-gray-50 md:flex ${mobileTab === 'editor' ? 'hidden' : 'flex'}`}>
                {/* Toolbar */}
                <div className="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
                    <div className="flex items-center gap-4">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                            Anteprima Live
                        </span>
                    </div>
                    <div className="text-xs text-gray-400">
                        {formData.restaurant_name ? `${formData.restaurant_name}` : 'Anteprima'}
                    </div>
                </div>

                {/* Canvas */}
                <div className="flex-1 overflow-hidden md:overflow-auto md:p-8 flex flex-col items-center justify-start bg-white md:bg-gray-100/50">
                    <div
                        className="w-full h-full md:bg-white md:shadow-2xl md:transition-all md:duration-300 md:origin-top relative md:max-w-[400px] md:h-full md:rounded-3xl z-10 overflow-y-auto scrollbar-hide md:border md:border-gray-200"
                    >

                        <ThemeWrapper>
                            <div
                                ref={mainRef}
                                className="min-h-full pb-8 overflow-y-auto h-full scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
                                style={{
                                    backgroundColor: mockTenant.background_color,
                                    '--tenant-primary': mockTenant.primary_color,
                                    '--tenant-secondary': mockTenant.secondary_color,
                                    '--tenant-background': mockTenant.background_color,
                                    '--tenant-surface': currentTheme.colors.surface,
                                    '--tenant-text': currentTheme.colors.text,
                                    '--tenant-text-secondary': currentTheme.colors.textSecondary,
                                    '--tenant-border': currentTheme.colors.border,
                                    '--tenant-price': currentTheme.colors.price,
                                    '--tenant-accent': currentTheme.colors.accent,
                                    color: currentTheme.colors.text
                                } as React.CSSProperties}
                            >
                                <Header
                                    restaurantName={mockTenant.restaurant_name}
                                    logoUrl={mockTenant.logo_url}
                                    logoHeight={currentTheme.logoHeight}
                                    forceMobile={true}
                                    className="sticky top-0 z-20 w-full"
                                    mobileHeaderStyle={currentTheme.mobileHeaderStyle}
                                />

                                <CategoryNav
                                    categories={MOCK_CATEGORIES}
                                    activeCategory={activeCategory}
                                    onCategoryClick={handleCategoryClick}
                                    className="sticky top-[72px] z-10 w-full"
                                />

                                {/* Hero */}
                                <section className="relative h-[20vh] flex items-center justify-center overflow-hidden mb-6">
                                    <div
                                        className="absolute inset-0 bg-cover bg-center"
                                        style={{
                                            backgroundColor: mockTenant.primary_color,
                                            opacity: 0.1
                                        }}
                                    />
                                    <div className="relative z-10 text-center px-4">
                                        <h1
                                            className="font-display font-bold mb-2 theme-heading text-3xl"
                                            style={{ color: mockTenant.hero_title_color }}
                                        >
                                            {mockTenant.restaurant_name}
                                        </h1>
                                        <p
                                            className="text-sm theme-body"
                                            style={{ color: mockTenant.hero_tagline_color }}
                                        >
                                            {mockTenant.tagline}
                                        </p>
                                    </div>
                                </section>

                                <main className="container mx-auto px-4 relative z-10 space-y-8">
                                    {MOCK_CATEGORIES.map((category) => (
                                        <section key={category.id} id={category.id}>
                                            <div className="flex items-center justify-center gap-4 mb-4">
                                                <ThemeDivider dividerStyle={currentTheme.dividerStyle} />
                                                <h2 className="font-display text-xl font-bold text-center shrink-0 px-2 theme-heading" style={{ color: mockTenant.primary_color }}>
                                                    {category.name}
                                                </h2>
                                                <ThemeDivider dividerStyle={currentTheme.dividerStyle} />
                                            </div>

                                            <div className="grid gap-6 grid-cols-1">
                                                {category.dishes.map((dish) => (
                                                    <DishCard key={dish.id} dish={dish} tenantSlug={mockTenant.slug} />
                                                ))}
                                            </div>
                                        </section>
                                    ))}
                                </main>

                                <Footer
                                    footerData={{
                                        locations: [{ city: 'Roma', address: 'Via Roma 1' }],
                                        socials: [],
                                        show_brand_column: true
                                    }}
                                    restaurantName={mockTenant.restaurant_name}
                                    slug={mockTenant.slug}
                                    logoUrl={mockTenant.logo_url}
                                    forceMobile={true}
                                />
                            </div>
                        </ThemeWrapper>
                    </div>


                </div>
            </div>
        </div >
    );
}
