'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Dish } from '@/types/menu';
import { useTranslation } from '@/hooks/useTranslation';
import { parseIngredients } from '@/utils/ingredientParser';
import { useGlutenFilter } from '@/contexts/GlutenFilterContext';
import { Leaf, Home, Snowflake } from 'lucide-react';

interface DishCardProps {
  dish: Dish & {
    is_seasonal?: boolean;
    is_vegetarian?: boolean;
    is_vegan?: boolean;
    is_gluten_free?: boolean;
  };
  tenantSlug: string;
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

export default function DishCard({ dish, tenantSlug }: DishCardProps) {
  const { isGlutenFree } = useGlutenFilter();
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const placeholderImage = '/no-image.svg';

  // Verifica se il piatto contiene glutine
  const containsGluten = dish.allergens?.includes('glutine') || false;

  // Il piatto è disabilitato se il filtro glutine è attivo E contiene glutine
  const isDisabled = isGlutenFree && containsGluten;

  // Piatti stagionali che mostrano "fuori stagione" invece dell'immagine
  const isSeasonalDish = dish.is_seasonal || false;

  // Determine if we should show placeholder
  const isLegacyPlaceholder = dish.image?.includes('icon.svg') || dish.image?.includes('favicon.svg');
  const showPlaceholder = !dish.image || imageError || isLegacyPlaceholder;

  return (
    <div className={`bg-[var(--tenant-surface,#FFFFFF)] rounded-2xl shadow-lg overflow-hidden transition-all duration-300 ${isDisabled
      ? 'opacity-50 pointer-events-none'
      : 'hover:shadow-2xl hover:-translate-y-1'
      }`}>
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[var(--tenant-background,#FFF8E7)]">
        {/* Placeholder "Fuori stagione" per piatti stagionali */}
        {isSeasonalDish ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-[var(--tenant-background,#FFF8E7)]">
            <div className="text-center max-w-xs">
              <div className="text-7xl mb-6 opacity-40">🌿</div>
              <div className="text-xl md:text-2xl font-serif font-bold text-[var(--tenant-primary,#8B0000)] mb-3">
                Fuori stagione
              </div>
              <div className="text-sm md:text-base text-gray-700 leading-relaxed">
                Disponibile solo nel periodo stagionale
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Skeleton Loader - visibile solo durante il caricamento e se non è placeholder */}
            {!imageLoaded && !showPlaceholder && (
              <div className="absolute inset-0 animate-shimmer" />
            )}

            <Image
              src={showPlaceholder ? placeholderImage : dish.image!}
              alt={dish.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className={`
                  ${showPlaceholder ? 'object-contain p-12 opacity-40 grayscale' : 'object-cover opacity-100'} 
                  hover:scale-105 transition-transform duration-500
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
          className="absolute top-4 right-4 text-[var(--tenant-price,#171717)] px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm"
          style={{ backgroundColor: 'var(--tenant-price-bg, var(--tenant-secondary, #D4AF37))' }}
        >
          <span className="font-bold text-base">€{dish.price}</span>
        </div>

        {/* Badge glutine quando filtro attivo */}
        {isDisabled && (
          <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm">
            <span className="font-semibold text-xs flex items-center gap-1">
              <span>🌾</span>
              Contiene glutine
            </span>
          </div>
        )}

        {/* Badge Fatto in casa e Surgelato */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {!isDisabled && dish.is_homemade && (
            <div
              className="px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm"
              style={{
                backgroundColor: 'var(--tenant-badge-bg, var(--tenant-primary, #8B0000))',
                color: 'var(--tenant-badge-text, #FFFFFF)'
              }}
            >
              <span className="font-semibold text-xs flex items-center gap-1">
                <span>🏠</span>
                Fatto in casa
              </span>
            </div>
          )}
          {!isDisabled && dish.is_frozen && (
            <div className="bg-blue-500 text-white px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm">
              <span className="font-semibold text-xs flex items-center gap-1">
                <span>❄️</span>
                Surgelato
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 md:p-5">
        <h3 className="text-lg md:text-xl lg:text-2xl font-serif font-bold text-[var(--tenant-text,#171717)] mb-2 leading-tight">
          {dish.name}
        </h3>

        <div className="text-[var(--tenant-text-secondary,#4B5563)] text-sm md:text-base leading-relaxed mb-3 min-h-[3em]">
          {parseIngredients(dish.description)}
        </div>

        {/* Diet & Feature Badges */}
        <div className="flex flex-wrap gap-2 mb-3">
          {dish.is_vegetarian && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
              <Leaf className="w-3 h-3" /> Vegetariano
            </span>
          )}
          {dish.is_vegan && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
              <Leaf className="w-3 h-3" /> Vegano
            </span>
          )}

          {dish.is_homemade && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-100">
              <Home className="w-3 h-3" /> Fatto in casa
            </span>
          )}
          {dish.is_frozen && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
              <Snowflake className="w-3 h-3" /> Surgelato
            </span>
          )}
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
                    color: 'var(--tenant-primary, #8B0000)',
                    borderColor: 'color-mix(in srgb, var(--tenant-accent, #d97706) 30%, transparent)'
                  }}
                >
                  {allergenTranslations[allergen]?.it || allergen}
                </span>
              ))}
            </div>
            <Link
              href={`/${tenantSlug}/allergeni`}
              className="inline-flex items-center gap-1.5 text-sm hover:brightness-75 font-medium transition-all"
              style={{ color: 'var(--tenant-primary, #8B0000)' }}
            >
              <span>ℹ️</span>
              Vedi info allergeni
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

