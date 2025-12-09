'use client';

import { useEffect, useRef } from 'react';
import { Category } from '@/types/menu';
import { useTranslation } from '@/hooks/useTranslation';

interface CategoryNavProps {
  categories: Category[];
  activeCategory: string | null;
  onCategoryClick: (categoryId: string) => void;
  logoHeight?: number;
}

export default function CategoryNav({ categories, activeCategory, onCategoryClick, logoHeight = 40 }: CategoryNavProps) {
  const navRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  // Calculate top offset based on logo height + padding
  // Mobile padding: py-3 (12px * 2 = 24px) -> total header = logoHeight + 24
  // Desktop padding: py-4 (16px * 2 = 32px) -> total header = logoHeight + 32
  // We use CSS variables to handle media query logic cleanly if possible, 
  // or just a calc that might be slightly off on resize if not careful.
  // Actually, media queries in inline styles are hard.
  // Best approach: use a style block or a CSS variable.

  const headerHeightMobile = logoHeight + 24;
  const headerHeightDesktop = logoHeight + 32;

  // We can use a custom property and a media query in a <style> tag or simpler: 
  // Just stick to a reasonable calculation. The standard theme uses fixed padding.

  useEffect(() => {
    if (!activeCategory || !navRef.current) return;
    // ... existing scroll logic ...
    const activeButton = buttonRefs.current[activeCategory];
    const container = navRef.current;

    if (activeButton && container) {
      const containerWidth = container.offsetWidth;
      const buttonLeft = activeButton.offsetLeft;
      const buttonWidth = activeButton.offsetWidth;

      // Centra il pulsante
      const scrollPosition = buttonLeft - (containerWidth / 2) + (buttonWidth / 2);

      container.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });
    }
  }, [activeCategory]);

  return (
    <>
      <style jsx global>{`
        :root {
          --header-height: ${headerHeightMobile}px;
        }
        @media (min-width: 768px) {
          :root {
            --header-height: ${headerHeightDesktop}px;
          }
        }
      `}</style>
      <nav
        className="sticky z-40 bg-gradient-to-r from-[var(--tenant-background,#FFF8E7)] to-[var(--tenant-surface,#FFFFFF)] shadow-md border-b border-gray-200/50"
        style={{ top: 'var(--header-height)' }}
      >
        <div ref={navRef} className="overflow-x-auto scrollbar-hide max-w-full">
          <div className="flex gap-2 px-4 py-3 min-w-max">
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                ref={(el) => {
                  buttonRefs.current[category.id] = el;
                }}
                onClick={() => onCategoryClick(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all touch-manipulation ${activeCategory === category.id
                  ? 'bg-[var(--tenant-primary,#8B0000)] text-[var(--tenant-background,#FFFFFF)] shadow-lg scale-105'
                  : 'bg-[var(--tenant-surface,#FFFFFF)] text-[var(--tenant-text-secondary,#4B5563)] hover:bg-gray-100 active:bg-gray-200 border border-gray-200'
                  }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </nav>
    </>
  );
}

