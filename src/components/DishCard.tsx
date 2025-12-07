'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Dish } from '@/types/menu';
import { useTranslation } from '@/hooks/useTranslation';
import { useState } from 'react';
import { parseIngredients } from '@/utils/ingredientParser';
import { useGlutenFilter } from '@/contexts/GlutenFilterContext';

interface DishCardProps {
  dish: Dish;
}

const allergenTranslations: Record<string, { it: string; en: string }> = {
  glutine: { it: 'Glutine', en: 'Gluten' },
  crostacei: { it: 'Crostacei', en: 'Crustaceans' },
  uova: { it: 'Uova', en: 'Eggs' },
  pesce: { it: 'Pesce', en: 'Fish' },
  arachidi: { it: 'Arachidi', en: 'Peanuts' },
  soia: { it: 'Soia', en: 'Soy' },
  lattosio: { it: 'Lattosio', en: 'Lactose' },
  'frutta-secca': { it: 'Frutta secca', en: 'Nuts' },
  sedano: { it: 'Sedano', en: 'Celery' },
  senape: { it: 'Senape', en: 'Mustard' },
  sesamo: { it: 'Sesamo', en: 'Sesame' },
  solfiti: { it: 'Solfiti', en: 'Sulphites' },
  lupini: { it: 'Lupini', en: 'Lupin' },
  molluschi: { it: 'Molluschi', en: 'Molluscs' },
};

export default function DishCard({ dish }: DishCardProps) {
  const { t, language } = useTranslation();
  const { isGlutenFree } = useGlutenFilter();
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const placeholderImage = '/favicon.svg';

  // Verifica se il piatto contiene glutine
  const containsGluten = dish.allergens?.includes('glutine') || false;

  // Il piatto è disabilitato se il filtro glutine è attivo E contiene glutine
  const isDisabled = isGlutenFree && containsGluten;

  // Piatti stagionali che mostrano "fuori stagione" invece dell'immagine
  const seasonalDishes = ['carciofi-romana', 'carciofo-giudia'];
  const isSeasonalDish = seasonalDishes.includes(dish.id);

  return (
    <div className={`bg-[var(--tenant-surface,#FFFFFF)] rounded-2xl shadow-lg overflow-hidden transition-all duration-300 ${isDisabled
      ? 'opacity-50 pointer-events-none'
      : 'hover:shadow-2xl hover:-translate-y-1'
      }`}>
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-[var(--tenant-background,#FFF8E7)] to-[var(--tenant-secondary,#D4AF37)]/20">
        {/* Placeholder "Fuori stagione" per piatti stagionali */}
        {isSeasonalDish ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-gradient-to-br from-[var(--tenant-background,#FFF8E7)] via-[#F5E6D3] to-[#E8D9C4]">
            <div className="text-center max-w-xs">
              <div className="text-7xl mb-6 opacity-40">🌿</div>
              <div className="text-xl md:text-2xl font-serif font-bold text-[var(--tenant-primary,#8B0000)] mb-3">
                {language === 'it' ? 'Fuori stagione' : 'Out of season'}
              </div>
              <div className="text-sm md:text-base text-gray-700 leading-relaxed">
                {language === 'it'
                  ? 'Disponibile solo nel periodo stagionale'
                  : 'Available only in season'}
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Skeleton Loader - visibile solo durante il caricamento */}
            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 animate-shimmer" />
            )}

            {/* Immagine */}
            <Image
              src={imageError ? placeholderImage : dish.image}
              alt={t(dish.name)}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className={`
                ${imageError ? 'object-contain p-8' : 'object-cover'} 
                hover:scale-105 transition-transform duration-500
                ${imageLoaded ? 'opacity-100' : 'opacity-0'}
              `}
              priority={false}
              onLoad={() => setImageLoaded(true)}
              onError={() => {
                setImageError(true);
                setImageLoaded(true);
              }}
            />
          </>
        )}
        {/* Price badge */}
        <div
          className="absolute top-4 right-4 text-[var(--tenant-background,#FFFFFF)] px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm"
          style={{ backgroundColor: 'var(--tenant-price, var(--tenant-secondary, #D4AF37))' }}
        >
          <span className="font-bold text-base">€{dish.price}</span>
        </div>

        {/* Badge glutine quando filtro attivo */}
        {isDisabled && (
          <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm">
            <span className="font-semibold text-xs flex items-center gap-1">
              <span>🌾</span>
              {language === 'it' ? 'Contiene glutine' : 'Contains gluten'}
            </span>
          </div>
        )}
      </div>

      <div className="p-4 md:p-5">
        <h3 className="text-lg md:text-xl lg:text-2xl font-serif font-bold text-[var(--tenant-text,#171717)] mb-2 leading-tight">
          {t(dish.name)}
        </h3>

        <div className="text-[var(--tenant-text-secondary,#4B5563)] text-sm md:text-base leading-relaxed mb-3 min-h-[3em]">
          {parseIngredients(t(dish.description))}
        </div>

        {dish.allergens && dish.allergens.length > 0 && (
          <div className="mt-4 space-y-3">
            <div className="flex flex-wrap gap-2">
              {dish.allergens.map((allergen) => (
                <span
                  key={allergen}
                  className="text-xs px-2.5 py-1 rounded-full border transition-colors"
                  style={{
                    backgroundColor: 'color-mix(in srgb, var(--tenant-accent, #d97706) 10%, transparent)',
                    color: 'var(--tenant-accent, #d97706)',
                    borderColor: 'color-mix(in srgb, var(--tenant-accent, #d97706) 30%, transparent)'
                  }}
                >
                  {allergenTranslations[allergen]?.[language] || allergen}
                </span>
              ))}
            </div>
            <Link
              href="/allergeni"
              className="inline-flex items-center gap-1.5 text-sm hover:brightness-75 font-medium transition-all"
              style={{ color: 'var(--tenant-accent, #8B0000)' }}
            >
              <span>ℹ️</span>
              {language === 'it' ? 'Vedi info allergeni' : 'See allergen info'}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

