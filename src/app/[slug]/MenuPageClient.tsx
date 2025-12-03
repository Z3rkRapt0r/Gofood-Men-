"use client";
import { useState, useRef } from "react";
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
      className="min-h-screen bg-cream"
      style={{
        '--tenant-primary': tenant.primary_color,
        '--tenant-secondary': tenant.secondary_color,
      } as React.CSSProperties}
    >
      <Header restaurantName={tenant.restaurant_name} logoUrl={tenant.logo_url || undefined} />
      <CategoryNav
        categories={categories}
        activeCategory={activeCategory}
        onCategoryClick={handleCategoryClick}
      />
      {/* Hero Section */}
      <section className="relative h-[40vh] sm:h-[50vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/images/hero-bg.jpg)', filter: 'brightness(0.7)' }}
        />
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
            {tenant.restaurant_name}
          </h1>
          <p className="text-lg sm:text-xl max-w-2xl mx-auto">
            Autentica cucina romana nel cuore della città
          </p>
        </div>
      </section>
      {/* Menu Sections */}
      <main className="container mx-auto px-4 py-8">
        {categories.map((category) => (
          <section
            key={category.id}
            id={category.id}
            className="mb-16 scroll-mt-32"
          >
            {/* Category Title */}
            <div className="text-center mb-8">
              <div className="inline-block">
                <h2 className="font-display text-3xl sm:text-4xl font-bold text-roma-red mb-2">
                  {category.name.it}
                </h2>
                <div className="h-1 bg-gradient-to-r from-transparent via-gold to-transparent" />
              </div>
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
      <Footer />
      <ScrollToTop />
    </div>
  );
}
