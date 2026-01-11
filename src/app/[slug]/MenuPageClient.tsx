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
import { motion, AnimatePresence } from 'framer-motion';

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
  const [showSplash, setShowSplash] = useState(true);

  // Direction: 1 for next (swipe left), -1 for previous (swipe right)
  const [[page, direction], setPage] = useState([0, 0]);

  // Sync page state with activeCategory
  useEffect(() => {
    const index = categories.findIndex(c => c.id === activeCategory);
    if (index !== -1 && index !== page) {
      // Determine direction based on index difference if not set via swipe
      // If we jumped via nav, we strictly don't have a "swipe" direction, but we can infer
      const newDirection = index > page ? 1 : -1;
      setPage([index, newDirection]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory, categories]);

  const paginate = (newDirection: number) => {
    const currentIndex = categories.findIndex(c => c.id === activeCategory);
    if (currentIndex === -1) return;

    const nextIndex = currentIndex + newDirection;

    // Check bounds
    if (nextIndex < 0 || nextIndex >= categories.length) return;

    setPage([nextIndex, newDirection]);
    setActiveCategory(categories[nextIndex].id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategoryClick = (categoryId: string) => {
    const newIndex = categories.findIndex(c => c.id === categoryId);
    const currentIndex = categories.findIndex(c => c.id === activeCategory);
    const newDirection = newIndex > currentIndex ? 1 : -1;

    setPage([newIndex, newDirection]);
    setActiveCategory(categoryId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
      position: "absolute" as const, // Absolute for smooth transition overlap? Or relative?
      // Relative is usually better for height flow, but absolute is smoother for slide.
      // Let's stick to default flow first, but x translation usually works better if containers are aligned.
      // Actually, for "wait" mode, we don't need absolute.
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? "100%" : "-100%",
      opacity: 0,
    }),
  };

  // Correction for standard "wait" mode (no overlap)
  // If mode="wait", components don't exist efficiently at same time.
  // Sliding usually requires "popLayout" or absolute positioning for overlap.
  // Given the user wants "swipe", overlap is nicer. But let's try standard sliding first.

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
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 }
                }}
                className="w-full"
                // Drag properties for Swipe
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={1}
                onDragEnd={(e, { offset, velocity }) => {
                  const swipe = Math.abs(offset.x) * velocity.x;
                  // If swipe is massive or offset is large enough
                  if (swipe < -10000 || offset.x < -100) {
                    paginate(1); // Swipe Left -> Next
                  } else if (swipe > 10000 || offset.x > 100) {
                    paginate(-1); // Swipe Right -> Prev
                  }
                }}
              >
                <section id={category.id} className="touch-pan-y">
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
