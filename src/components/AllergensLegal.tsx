'use client';

import Image from 'next/image';
import { AllergenData } from '@/types/menu';
import { useTranslation } from '@/hooks/useTranslation';


interface AllergensLegalProps {
  data: AllergenData;
  logoUrl?: string; // Optional restaurant logo
  coverChargeValue?: number; // Dynamic value from DB
}

export default function AllergensLegal({ data, logoUrl, coverChargeValue }: AllergensLegalProps) {
  const { t } = useTranslation();

  // Format currency
  const formattedCoverCharge = new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR'
  }).format(coverChargeValue || 0);

  return (
    <div className="bg-[var(--tenant-surface,#FFFFFF)] rounded-xl shadow-lg overflow-hidden max-w-4xl mx-auto">
      {/* Header con logo ufficiale */}
      <div className="bg-gradient-to-r from-[var(--tenant-primary,#8B0000)] to-[var(--tenant-primary,#8B0000)] text-center py-8 px-6">
        <div className="inline-block bg-white/10 backdrop-blur-sm border-2 border-[var(--tenant-secondary,#D4AF37)] rounded-lg px-8 py-6">
          <Image
            src={logoUrl || '/icon.svg'}
            alt="Restaurant Logo"
            width={60}
            height={60}
            className="h-16 w-auto mx-auto mb-2 object-contain"
          />
          <p className="text-sm text-white/90 uppercase tracking-wider">
            Menu Digitale
          </p>
        </div>
      </div>

      {/* Contenuto */}
      <div className="p-6 md:p-8">
        {/* Titolo principale */}
        <h2 className="text-2xl md:text-3xl font-serif font-bold text-center text-[var(--tenant-text,#171717)] mb-6">
          ELENCO ALLERGENI
        </h2>

        {/* Intro */}
        <p className="text-sm md:text-base text-[var(--tenant-text-secondary,#4B5563)] mb-6 leading-relaxed">
          {data.legalText}
        </p>

        {/* Lista numerata allergeni */}
        <ol className="space-y-3 mb-8">
          {data.allergens.map((allergen) => (
            <li
              key={allergen.id}
              className="flex gap-3 text-sm md:text-base text-[var(--tenant-text,#171717)]"
            >
              <span className="font-bold text-[var(--tenant-primary,#8B0000)] min-w-[2rem]">
                {allergen.number}.
              </span>
              <span className="leading-relaxed">{allergen.name}</span>
            </li>
          ))}
        </ol>

        {/* Regolamento */}
        <div className="border-t-2 border-[var(--tenant-secondary,#D4AF37)] pt-6 space-y-4">
          <h3 className="text-lg font-bold text-center text-[var(--tenant-text,#171717)]">
            {data.regulationTitle}
          </h3>

          <p className="text-sm text-[var(--tenant-text-secondary,#4B5563)] leading-relaxed">
            <span className="font-semibold">*</span> {data.regulationText}
          </p>

          <p className="text-sm text-[var(--tenant-text-secondary,#4B5563)] leading-relaxed">
            <span className="font-semibold">**</span> {data.rapidCooling}
          </p>

          <p className="text-sm text-[var(--tenant-text-secondary,#4B5563)] leading-relaxed">
            <span className="font-semibold">N.B.</span> {data.note}
          </p>

          <div className="bg-[var(--tenant-background,#FFF8E7)] rounded-lg p-4 mt-6">
            <p className="text-xs md:text-sm text-[var(--tenant-text,#171717)] italic leading-relaxed">
              {data.contactText}
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-[var(--tenant-text,#171717)] text-[var(--tenant-surface,#FFFFFF)] text-center py-4">
        <p className="text-sm md:text-base font-medium">
          Costo del coperto: {formattedCoverCharge}
        </p>
      </div>
    </div>
  );
}

