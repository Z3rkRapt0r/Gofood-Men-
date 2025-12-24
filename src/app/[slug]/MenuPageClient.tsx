"use client";
import React, { useState, useRef, useEffect } from 'react';
import { FooterData } from '@/types/menu';
import Header from '@/components/Header';
import CategoryNav from '@/components/CategoryNav';
import DishCard from '@/components/DishCard';
import ScrollToTop from '@/components/ScrollToTop';
import Footer from '@/components/Footer';
import { ThemeProvider, useTheme } from '@/components/theme/ThemeContext';
import { ThemeWrapper } from '@/components/theme/ThemeWrapper';
import { ThemeDivider } from '@/components/theme/ThemeDivider';
import { ThemeConfig } from '@/lib/theme-engine/types';

interface Tenant {
  restaurant_name: string;
  logo_url?: string;
  slug: string;
  tagline?: string;
  footer_data?: FooterData;
  // Legacy fields are ignored now
}

interface Dish {
  id: string;
  name: string;
  description: string;
  price: string;
  image: string;
  allergens: string[];
  is_seasonal?: boolean;
  is_vegetarian?: boolean;
  is_vegan?: boolean;
  is_gluten_free?: boolean;
  is_homemade?: boolean;
  is_frozen?: boolean;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  dishes: Dish[];
}

function MenuContent({ tenant, categories }: { tenant: Tenant, categories: Category[] }) {
  const { currentTheme } = useTheme();
  const [activeCategory, setActiveCategory] = useState<string | null>(categories[0]?.id ?? null);
  const mainRef = useRef<HTMLDivElement>(null);
  const isManualScroll = useRef(false);
  const scrollTimeout = useRef<NodeJS.Timeout>(undefined);

  const handleCategoryClick = (categoryId: string) => {
    // Set manual scroll flag to prevent IntersectionObserver from fighting back
    isManualScroll.current = true;
    setActiveCategory(categoryId);

    // Clear existing timeout
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);

    if (mainRef.current) {
      const section = mainRef.current.querySelector(`#${categoryId}`) as HTMLElement;
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }

    // Release lock after animation (approx 1s)
    scrollTimeout.current = setTimeout(() => {
      isManualScroll.current = false;
    }, 1000);
  };

  useEffect(() => {
    const options = {
      rootMargin: '-150px 0px -60% 0px',
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      // Skip updates if we are manually scrolling
      if (isManualScroll.current) return;

      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveCategory(entry.target.id);
        }
      });
    }, options);

    categories.forEach((category) => {
      const element = document.getElementById(category.id);
      if (element) observer.observe(element);
    });

    return () => {
      observer.disconnect();
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    };
  }, [categories]);

  return (
    <div
      ref={mainRef}
      className="min-h-screen pt-[135px] select-none"
      style={{
        backgroundColor: currentTheme.colors.background,
        color: currentTheme.colors.text,
        '--tenant-primary': currentTheme.colors.primary,
        '--tenant-secondary': currentTheme.colors.secondary,
        '--tenant-background': currentTheme.colors.background,
        '--tenant-surface': currentTheme.colors.surface,
        '--tenant-text': currentTheme.colors.text,
        '--tenant-text-secondary': currentTheme.colors.textSecondary,
        '--tenant-border': currentTheme.colors.border,
        '--tenant-price': currentTheme.colors.price,
        '--tenant-accent': currentTheme.colors.accent,
      } as React.CSSProperties}
    >
      <Header
        restaurantName={tenant.restaurant_name}
        logoUrl={tenant.logo_url}
        logoHeight={currentTheme.logoHeight}
        mobileHeaderStyle={currentTheme.mobileHeaderStyle}
      />

      <CategoryNav
        categories={categories}
        activeCategory={activeCategory}
        onCategoryClick={handleCategoryClick}
      />

      {/* Hero Section */}
      <section className="relative h-[25vh] sm:h-[35vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundColor: currentTheme.colors.primary,
            opacity: 0.1
          }}
        />
        {/* Optional: Add a real image back if available, currently using color overlay pattern */}

        <div className="relative z-10 text-center px-4">
          <h1
            className="font-display text-4xl sm:text-5xl md:text-6xl font-bold mb-4 theme-heading"
            style={{ color: currentTheme.colors.primary }} // Or specific hero color? Using primary for now
          >
            {tenant.restaurant_name}
          </h1>
          <p
            className="text-lg sm:text-xl max-w-2xl mx-auto theme-body"
            style={{ color: currentTheme.colors.secondary }}
          >
            {tenant.tagline || 'Autentica cucina romana nel cuore della città'}
          </p>
        </div>
      </section>

      {/* Menu Sections */}
      <main className="container mx-auto px-4 py-4 space-y-16">
        {categories.map((category) => (
          <section
            key={category.id}
            id={category.id}
            className="scroll-mt-32"
          >
            {/* Category Title with Dividers */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <ThemeDivider dividerStyle={currentTheme.dividerStyle} className="max-w-[100px]" />
              <h2
                className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-center shrink-0 px-4 theme-heading"
                style={{ color: currentTheme.colors.primary }}
              >
                {category.name}
              </h2>
              <ThemeDivider dividerStyle={currentTheme.dividerStyle} className="max-w-[100px]" />
            </div>

            {/* Category Description */}
            {category.description && (
              <p className="text-center text-lg mb-8 max-w-2xl mx-auto theme-body" style={{ color: currentTheme.colors.secondary }}>
                {category.description}
              </p>
            )}

            {/* Dishes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {category.dishes.map((dish) => (
                <DishCard key={dish.id} dish={dish} tenantSlug={tenant.slug} />
              ))}
            </div>
          </section>
        ))}
      </main>

      <Footer
        footerData={tenant.footer_data}
        restaurantName={tenant.restaurant_name}
        logoUrl={tenant.logo_url || undefined}
        slug={tenant.slug}
      />
      <ScrollToTop />
    </div>
  );
}

export default function MenuPageClient({ tenant, categories, initialTheme }: { tenant: Tenant, categories: Category[], initialTheme?: ThemeConfig }) {
  return (
    <ThemeProvider initialTheme={initialTheme}>
      <ThemeWrapper>
        <MenuContent tenant={tenant} categories={categories} />
      </ThemeWrapper>
    </ThemeProvider>
  );
}
