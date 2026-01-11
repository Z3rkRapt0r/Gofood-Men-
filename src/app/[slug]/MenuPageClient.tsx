"use client";
import React, { useState, useRef, useEffect } from 'react';
import { FooterData } from '@/types/menu';
import Header from '@/components/Header';
import CategoryNav from '@/components/CategoryNav';
import DishCard from '@/components/DishCard';
import ScrollToTop from '@/components/ScrollToTop';
import Footer from '@/components/Footer';
import SplashScreen from '@/components/ui/splash-screen';
import { ThemeProvider, useTheme } from '@/components/theme/ThemeContext';
import { ThemeWrapper } from '@/components/theme/ThemeWrapper';
import { ThemeDivider } from '@/components/theme/ThemeDivider';
import { ThemeConfig } from '@/lib/theme-engine/types';
import { motion, AnimatePresence, Variants } from 'framer-motion';

interface Tenant {
  restaurant_name: string;
  logo_url?: string;
  slug: string;
  tagline?: string;
  footer_data?: FooterData;
}

// Tuned animations for "Fluid Harmony" feel
const variants: Variants = {
  enter: (direction: number) => {
    return {
      x: direction > 0 ? 200 : -200, // Slightly more distance for flow
      opacity: 0,
      transition: {
        x: { type: "tween", duration: 0.35, ease: "easeInOut" }, // Smooth entry
        opacity: { duration: 0.35 }
      } as const
    };
  },
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    transition: {
      x: { type: "tween", duration: 0.35, ease: "easeInOut" },
      opacity: { duration: 0.35 }
    } as const
  },
  exit: (direction: number) => {
    return {
      zIndex: 0,
      x: direction < 0 ? 200 : -200, // Matching distance
      opacity: 0,
      transition: {
        x: { type: "tween", duration: 0.35, ease: "easeInOut" }, // Smooth exit matching entry
        opacity: { duration: 0.35 }
      } as const
    };
  },
};

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
  const [showSplash, setShowSplash] = useState(true);
  const [direction, setDirection] = useState(0);

  const activeIndex = categories.findIndex((c) => c.id === activeCategory);

  const handleCategoryChange = (newCategoryId: string) => {
    const newIndex = categories.findIndex((c) => c.id === newCategoryId);
    if (newIndex > activeIndex) {
      setDirection(1);
    } else if (newIndex < activeIndex) {
      setDirection(-1);
    }
    setActiveCategory(newCategoryId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategoryClick = (categoryId: string) => {
    handleCategoryChange(categoryId);
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };


  return (
    <div
      className="min-h-screen pt-[135px] select-none overflow-x-hidden"
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
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}

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
            backgroundColor: currentTheme.colors.overlay || currentTheme.colors.primary,
            opacity: currentTheme.colors.overlayOpacity ?? 0.1
          }}
        />
        {/* Optional: Add a real image back if available, currently using color overlay pattern */}
        <div className="relative z-10 text-center px-4">
          <h1
            className="font-display text-4xl sm:text-5xl md:text-6xl font-bold mb-4 theme-heading"
            style={{ color: currentTheme.colors.primary }}
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
      <main className="container mx-auto px-4 py-4 space-y-16 min-h-[60vh] overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          {categories.map((category) => (
            activeCategory === category.id && (
              <motion.div
                key={category.id}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={1}
                onDragEnd={(e, { offset, velocity }) => {
                  const swipe = swipePower(offset.x, velocity.x);

                  if (swipe < -swipeConfidenceThreshold) {
                    // Swipe Left -> Next Category
                    if (activeIndex < categories.length - 1) {
                      handleCategoryChange(categories[activeIndex + 1].id);
                    }
                  } else if (swipe > swipeConfidenceThreshold) {
                    // Swipe Right -> Prev Category
                    if (activeIndex > 0) {
                      handleCategoryChange(categories[activeIndex - 1].id);
                    }
                  }
                }}
                className="w-full touch-pan-y"
              >
                <section id={category.id}>
                  {/* Category Title with Dividers */}
                  <div className="flex items-center justify-center gap-4 mb-8">
                    <ThemeDivider
                      dividerStyle={currentTheme.dividerStyle}
                      className={currentTheme.dividerStyle === 'gradient' ? 'flex-1' : 'max-w-[100px] w-full'}
                    />
                    <h2
                      className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-center shrink-0 px-4 theme-heading"
                      style={{ color: currentTheme.colors.primary }}
                    >
                      {category.name}
                    </h2>
                    <ThemeDivider
                      dividerStyle={currentTheme.dividerStyle}
                      className={currentTheme.dividerStyle === 'gradient' ? 'flex-1' : 'max-w-[100px] w-full'}
                    />
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
              </motion.div>
            )
          ))}
        </AnimatePresence>
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
