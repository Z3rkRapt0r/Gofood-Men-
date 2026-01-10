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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Use same MOCK DATA as DesignLab for consistency
// MOCK DATA REMOVED

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
    footerSlot?: React.ReactNode;
}

import { useCategories, useDishes } from '@/hooks/useMenu';

export default function BrandingDesignLab({ formData, onUpdate, onNext, onBack, hideNavigation, tenantId, footerSlot }: BrandingDesignLabProps) {
    const { currentTheme } = useTheme();
    const [activeCategory, setActiveCategory] = useState<string>('');
    const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');
    const mainRef = useRef<HTMLDivElement>(null);

    // Fetch Real Data
    const { data: categories = [] } = useCategories(tenantId);
    const { data: dishes = [] } = useDishes(tenantId);

    // Prepare Preview Data
    const previewCategories = React.useMemo(() => {
        if (!categories) return [];
        return categories.map(c => ({
            ...c,
            dishes: dishes
                ?.filter(d => d.category_id === c.id && d.is_visible !== false)
                .map(d => ({
                    ...d,
                    image: d.image_url || '/images/dish-placeholder.jpg',
                    price: d.price.toString(),
                    description: d.description || '', // Ensure string
                    allergens: d.allergen_ids,
                    // Map other mismatching fields if necessary
                    // UI Dish expects 'image' (string), DB has 'image_url'
                })) || []
        })).filter(c => c.dishes.length > 0);
    }, [categories, dishes]);

    // Set initial active category
    React.useEffect(() => {
        if (previewCategories.length > 0 && !activeCategory) {
            setActiveCategory(previewCategories[0].id);
        }
    }, [previewCategories, activeCategory]);

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
        restaurant_name: formData.footer_data?.public_name ?? formData.restaurant_name,
        logo_url: formData.logo_url,
        primary_color: currentTheme.colors.primary,
        secondary_color: currentTheme.colors.secondary,
        background_color: currentTheme.colors.background,
        slug: formData.slug || "design-kitchen",
        tagline: formData.footer_data?.tagline || "",
        hero_title_color: currentTheme.colors.text === '#ffffff' || currentTheme.colors.background === '#1c1917' ? '#FFFFFF' : currentTheme.colors.primary,
        hero_tagline_color: currentTheme.colors.text === '#ffffff' || currentTheme.colors.background === '#1c1917' ? '#E5E7EB' : currentTheme.colors.secondary,
    };

    return (
        <div className="flex flex-col md:flex-row h-full bg-white font-sans md:overflow-hidden relative">
            {/* Mobile Tabs - Shadcn UI */}
            <div className="md:hidden p-2 border-b border-gray-100 bg-white z-20 sticky top-0">
                <Tabs value={mobileTab} onValueChange={(v) => setMobileTab(v as 'editor' | 'preview')} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 h-10 bg-gray-100/80">
                        <TabsTrigger
                            value="editor"
                            className="text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm transition-all"
                        >
                            🎨 Editor
                        </TabsTrigger>
                        <TabsTrigger
                            value="preview"
                            className="text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm transition-all"
                        >
                            📱 Anteprima
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {/* Left Panel: Editor */}
            <div className={`w-full md:w-96 flex flex-col border-r border-gray-200 md:flex flex-1 min-h-0 ${mobileTab === 'preview' ? 'hidden' : 'flex'}`}>
                <VisualEditorPanel
                    logoUrl={formData.logo_url}
                    slug={formData.slug}
                    restaurantName={formData.restaurant_name}
                    publicName={formData.footer_data?.public_name}
                    tagline={formData.footer_data?.tagline}
                    tenantId={tenantId}
                    onLogoChange={(url) => onUpdate({ logo_url: url })}
                    onPublicNameChange={(name) => onUpdate({ footer_data: { ...formData.footer_data, public_name: name } })}
                    onTaglineChange={(tagline) => onUpdate({ footer_data: { ...formData.footer_data, tagline: tagline } })}
                    brandDescription={formData.footer_data?.brand_description?.it}
                    onBrandDescriptionChange={(desc) => onUpdate({
                        footer_data: {
                            ...formData.footer_data,
                            brand_description: {
                                ...formData.footer_data?.brand_description,
                                it: desc,
                                en: desc
                            }
                        }
                    })}
                />

                {/* Custom Footer Slot (e.g. Save Button) */}
                {footerSlot && (
                    <div className="p-4 border-t border-gray-200 bg-white shrink-0">
                        {footerSlot}
                    </div>
                )}

                {/* Navigation Buttons embedded in the sidebar for better UX */}
                {!hideNavigation && (
                    <div className="p-4 border-t border-gray-200 bg-white flex flex-col gap-3 shrink-0">
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
            <div className={`flex-1 flex flex-col h-full md:overflow-hidden relative bg-gray-50 md:flex ${mobileTab === 'editor' ? 'hidden' : 'flex'}`}>
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
                <div className="flex-1 overflow-y-auto md:p-8 flex flex-col items-center justify-start bg-white md:bg-gray-100/50">
                    <div
                        className="w-full h-full md:bg-white md:shadow-2xl md:transition-all md:duration-300 md:origin-top relative md:max-w-[400px] md:h-full md:rounded-3xl md:overflow-y-auto scrollbar-hide md:border md:border-gray-200"
                    >

                        <ThemeWrapper>
                            <div
                                ref={mainRef}
                                className="min-h-full pb-8 md:overflow-y-auto h-full scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
                                style={{
                                    // Cleaned up: ThemeWrapper handles CSS variables now
                                    backgroundColor: mockTenant.background_color,
                                    color: currentTheme.colors.text
                                } as React.CSSProperties}
                            >
                                <Header
                                    restaurantName={mockTenant.restaurant_name}
                                    logoUrl={mockTenant.logo_url}
                                    logoHeight={currentTheme.logoHeight}
                                    forceMobile={true}
                                    disableLanguageSwitcher={true}
                                    className="sticky top-0 z-20 w-full"
                                    mobileHeaderStyle={currentTheme.mobileHeaderStyle}
                                />

                                <CategoryNav
                                    categories={previewCategories}
                                    activeCategory={activeCategory}
                                    onCategoryClick={handleCategoryClick}
                                    className="sticky top-[72px] z-10 w-full"
                                />

                                {/* Hero */}
                                <section className="relative h-[20vh] flex items-center justify-center overflow-hidden mb-6">
                                    <div
                                        className="absolute inset-0 bg-cover bg-center"
                                        style={{
                                            backgroundColor: currentTheme.colors.overlay || mockTenant.primary_color,
                                            opacity: currentTheme.colors.overlayOpacity ?? 0.1
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
                                    {previewCategories.length === 0 ? (
                                        <div className="text-center py-20 opacity-50">
                                            <p className="theme-body">Nessun piatto visibile.</p>
                                            <p className="text-xs">Aggiungi piatti nel passaggio precedente per vederli qui.</p>
                                        </div>
                                    ) : (
                                        previewCategories.map((category) => (
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
                                        ))
                                    )}
                                </main>

                                <Footer
                                    footerData={{
                                        locations: [{ city: 'Roma', address: 'Via Roma 1' }],
                                        socials: [],
                                        show_brand_column: true,
                                        brand_description: formData.footer_data?.brand_description
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
