"use client";
import { useState, useEffect, useRef } from 'react';
import { FooterData } from '@/types/menu';
import Header from '@/components/Header';
import CategoryNav from '@/components/CategoryNav';
import DishCard from '@/components/DishCard';
import ScrollToTop from '@/components/ScrollToTop';
import Footer from '@/components/Footer';

interface Tenant {
  restaurant_name: string;
  logo_url?: string;
  primary_color: string;
  secondary_color: string;
  background_color?: string;
  surface_color?: string;
  text_color?: string;
  secondary_text_color?: string;
  footer_data?: FooterData;
  slug: string;
  tagline?: string;
  hero_title_color?: string;
  hero_tagline_color?: string;
}

interface Dish {
  id: string;
  name: { it: string; en: string };
  description: { it: string; en: string };
  price: string;
  image: string;
  allergens: string[];
}

interface Category {
  id: string;
  name: { it: string; en: string };
  dishes: Dish[];
}

export default function MenuPageClient({ tenant, categories }: { tenant: Tenant, categories: Category[] }) {
  const [activeCategory, setActiveCategory] = useState<string | null>(categories[0]?.id ?? null);
  const mainRef = useRef<HTMLDivElement>(null);

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId);
    if (mainRef.current) {
      const section = mainRef.current.querySelector(`#${categoryId}`) as HTMLElement;
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  return (
    <div
      ref={mainRef}
      className="min-h-screen"
      style={{
        backgroundColor: tenant.background_color || '#FFF8E7',
        '--tenant-primary': tenant.primary_color,
        '--tenant-secondary': tenant.secondary_color,
        '--tenant-background': tenant.background_color || '#FFF8E7',
        '--tenant-surface': tenant.surface_color || '#FFFFFF',
        '--tenant-text': tenant.text_color || '#171717',
        '--tenant-text-secondary': tenant.secondary_text_color || '#4B5563',
      } as React.CSSProperties}
    >
      <Header restaurantName={tenant.restaurant_name} logoUrl={tenant.logo_url || undefined} />
      <CategoryNav
        categories={categories}
        activeCategory={activeCategory}
        onCategoryClick={handleCategoryClick}
      />
      {/* Hero Section */}
      <section className="relative h-[25vh] sm:h-[35vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/images/hero-bg.jpg)', filter: 'brightness(0.7)' }}
        />
        <div className="relative z-10 text-center text-white px-4">
          <h1
            className="font-display text-4xl sm:text-5xl md:text-6xl font-bold mb-4"
            style={{ color: tenant.hero_title_color || '#FFFFFF' }}
          >
            {tenant.restaurant_name}
          </h1>
          <p
            className="text-lg sm:text-xl max-w-2xl mx-auto"
            style={{ color: tenant.hero_tagline_color || '#E5E7EB' }}
          >
            {tenant.tagline || 'Autentica cucina romana nel cuore della città'}
          </p>
        </div>
      </section>
      {/* Menu Sections */}
      <main className="container mx-auto px-4 py-4">
        {categories.map((category) => (
          <section
            key={category.id}
            id={category.id}
            className="mb-16 scroll-mt-32"
          >
            {/* Category Title */}
            {/* Category Title */}
            <div className="flex items-center justify-center gap-6 mb-8">
              <div
                className="flex-1 h-[3px] bg-gradient-to-r from-transparent via-current to-transparent opacity-80 max-w-xs sm:max-w-sm"
                style={{ color: tenant.secondary_color }}
              />
              <h2
                className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-center shrink-0 px-4"
                style={{ color: tenant.primary_color }}
              >
                {category.name.it}
              </h2>
              <div
                className="flex-1 h-[3px] bg-gradient-to-r from-transparent via-current to-transparent opacity-80 max-w-xs sm:max-w-sm"
                style={{ color: tenant.secondary_color }}
              />
            </div>
            {/* Dishes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {category.dishes.map((dish) => (
                <DishCard key={dish.id} dish={dish} />
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
