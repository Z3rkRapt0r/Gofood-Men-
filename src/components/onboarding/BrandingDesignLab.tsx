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
        name: { it: 'Antipasti', en: 'Starters' },
        dishes: [
            {
                id: 'd1',
                name: { it: 'Tartare di Tonno', en: 'Tuna Tartare' },
                description: { it: 'Tonno fresco, avocado, lime e sesamo.', en: 'Fresh tuna, avocado, lime and sesame.' },
                price: '18.00',
                image: '/images/dish-placeholder.jpg',
                allergens: ['fish', 'sesame']
            }
        ]
    },
    {
        id: 'primi',
        name: { it: 'Primi Piatti', en: 'First Courses' },
        dishes: [
            {
                id: 'd3',
                name: { it: 'Carbonara', en: 'Carbonara' },
                description: { it: 'Spaghetti, guanciale croccante, pecorino, uovo.', en: 'Spaghetti, crispy guanciale, pecorino cheese, egg.' },
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
}

export default function BrandingDesignLab({ formData, onUpdate, onNext, onBack }: BrandingDesignLabProps) {
    const { currentTheme } = useTheme();
    const [activeCategory, setActiveCategory] = useState<string>('antipasti');
    const mainRef = useRef<HTMLDivElement>(null);

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
        <div className="flex h-full bg-gray-100 font-sans overflow-hidden border-2 border-orange-100 rounded-2xl shadow-xl bg-white">
            {/* Left Panel: Editor */}
            <div className="w-96 flex flex-col border-r border-gray-200">
                <VisualEditorPanel
                    logoUrl={formData.logo_url}
                    slug={formData.slug}
                    onLogoChange={(url) => onUpdate({ logo_url: url })}
                />

                {/* Navigation Buttons embedded in the sidebar for better UX */}
                <div className="p-4 border-t border-gray-200 bg-white grid grid-cols-2 gap-3 shrink-0 z-50">
                    <button
                        onClick={onBack}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                    >
                        Indietro
                    </button>
                    <button
                        onClick={handleContinue}
                        className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg font-bold hover:shadow-md hover:scale-[1.02] transition-all"
                    >
                        Salva e Continua
                    </button>
                </div>
            </div>

            {/* Right Panel: Preview */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-gray-50">
                {/* Toolbar */}
                <div className="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
                    <div className="flex items-center gap-4">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                            Anteprima Live
                        </span>
                    </div>
                    <div className="text-xs text-gray-400">
                        {formData.slug ? `gofoodmenu.it/${formData.slug}` : 'Anteprima'}
                    </div>
                </div>

                {/* Canvas */}
                <div className="flex-1 overflow-auto p-4 md:p-8 flex flex-col items-center justify-start bg-gray-100/50">
                    <div
                        className="bg-white shadow-2xl transition-all duration-300 origin-top relative w-full max-w-[400px] h-full rounded-3xl z-10 overflow-y-auto scrollbar-hide border border-gray-200"
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
                                />

                                <CategoryNav
                                    categories={MOCK_CATEGORIES}
                                    activeCategory={activeCategory}
                                    onCategoryClick={handleCategoryClick}
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
                                                    {category.name.it}
                                                </h2>
                                                <ThemeDivider dividerStyle={currentTheme.dividerStyle} />
                                            </div>

                                            <div className="grid gap-6 grid-cols-1">
                                                {category.dishes.map((dish) => (
                                                    <DishCard key={dish.id} dish={dish} />
                                                ))}
                                            </div>
                                        </section>
                                    ))}
                                </main>

                                <Footer
                                    footerData={{
                                        locations: [{ city: 'Roma', address: 'Via Roma 1' }],
                                        links: [],
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
