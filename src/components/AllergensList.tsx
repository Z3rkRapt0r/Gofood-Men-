'use client';

import { Allergen } from '@/types/menu';
import { useTranslation } from '@/hooks/useTranslation';

interface AllergensListProps {
  allergens: Allergen[];
}

export default function AllergensList({ allergens }: AllergensListProps) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
      {allergens.map((allergen) => (
        <div
          key={allergen.id}
          className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow border border-gray-100"
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[var(--tenant-secondary,#D4AF37)] to-[#C4A037] rounded-full flex items-center justify-center text-2xl">
              {allergen.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-sm font-bold text-[var(--tenant-primary,#8B0000)] bg-[var(--tenant-primary,#8B0000)]/10 px-2 py-0.5 rounded">
                  {allergen.number}
                </span>
                <h3 className="text-lg font-bold text-gray-900 leading-tight">
                  {t(allergen.name)}
                </h3>
              </div>
              {allergen.description && (
                <p className="text-sm text-gray-600 leading-relaxed">
                  {t(allergen.description)}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

