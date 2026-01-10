'use client';

import { useEffect, useRef } from 'react';
import { Category } from '@/types/menu';
import { useTranslation } from '@/hooks/useTranslation';

interface CategoryNavProps {
  categories: Category[];
  activeCategory: string | null;
  onCategoryClick: (categoryId: string) => void;
  className?: string;
}

export default function CategoryNav({ categories, activeCategory, onCategoryClick, className }: CategoryNavProps) {
  const navRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  useEffect(() => {
    if (!activeCategory || !navRef.current) return;

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

  const positionClass = className || "fixed top-[72px] left-0 w-full z-40";

  return (
    <nav className={`${positionClass} bg-[var(--tenant-background,#FFFFFF)]/95 backdrop-blur-sm shadow-sm border-b border-gray-200/50`}>
      <div ref={navRef} className="overflow-x-auto scrollbar-hide">
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
  );
}

