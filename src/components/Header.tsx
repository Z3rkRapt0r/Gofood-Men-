'use client';

/* eslint-disable @next/next/no-img-element */

import Image from 'next/image';
import LanguageSwitcher from './LanguageSwitcher';
import { useGlutenFilter } from '@/contexts/GlutenFilterContext';

interface HeaderProps {
  restaurantName?: string;
  logoUrl?: string;
  forceMobile?: boolean;
  logoHeight?: number;
}

export default function Header({
  restaurantName = 'Menu Digitale',
  logoUrl = '/favicon.svg',
  forceMobile = false,
  logoHeight = 40
}: HeaderProps) {
  // Ensure logoUrl is properly encoded to handle spaces
  const sanitizedLogoUrl = logoUrl?.replace(/ /g, '%20') || '/favicon.svg';
  const { isGlutenFree, toggleGlutenFilter } = useGlutenFilter();

  return (
    <header className="sticky top-0 z-50 bg-[var(--tenant-surface,#FFFFFF)] transition-colors duration-200 max-w-full">
      <div className="container mx-auto px-4 py-3 md:py-4">
        {/* Layout mobile: logo sx, filtri dx */}
        {/* Layout mobile: filtro sx, logo centro, lingua dx */}
        <div className={`flex items-center justify-between relative ${forceMobile ? 'w-full' : 'md:hidden'}`}>
          {/* Pulsante filtro celiaci (Sinistra) */}
          <div className="w-12 flex justify-start">
            <button
              type="button"
              onClick={toggleGlutenFilter}
              className={`p-2 rounded-lg transition-colors ${isGlutenFree
                ? 'bg-[var(--tenant-secondary,#D4AF37)]/20 hover:bg-[var(--tenant-secondary,#D4AF37)]/30'
                : 'hover:bg-gray-100'
                }`}
              aria-label="Filtro senza glutine"
              aria-pressed={isGlutenFree}
            >
              <Image
                src="/gluten-free.png"
                alt="Filtro senza glutine"
                width={20}
                height={20}
                className="w-5 h-5"
              />
            </button>
          </div>

          {/* Logo (Centro) */}
          <div className="flex-1 flex items-center justify-center px-2">
            <img
              src={sanitizedLogoUrl}
              alt={restaurantName}
              style={{ height: `${logoHeight}px` }}
              className="w-auto max-w-[140px] object-contain transition-all duration-200"
            />
          </div>

          {/* Lingua (Destra) */}
          <div className="w-12 flex justify-end">
            <LanguageSwitcher compact={true} />
          </div>
        </div>

        {/* Layout desktop: logo centrato, filtri dx */}
        <div className={`hidden items-center justify-between relative ${forceMobile ? '' : 'md:flex'}`}>
          {/* Spacer per bilanciare il layout (Sinistra) */}
          <div className="w-[200px] flex justify-start">
            {/* Optional: Add Left elements here if needed later */}
          </div>

          {/* Logo centrato */}
          <div className="flex-1 flex items-center justify-center">
            <img
              src={sanitizedLogoUrl}
              alt={restaurantName}
              style={{ height: `${logoHeight}px` }}
              className="w-auto object-contain transition-all duration-200"
            />
          </div>

          {/* Gruppo controlli a destra */}
          <div className="w-[200px] flex items-center justify-end gap-3">
            {/* Pulsante filtro celiaci */}
            <button
              type="button"
              onClick={toggleGlutenFilter}
              className={`p-2.5 rounded-lg transition-colors ${isGlutenFree
                ? 'bg-[var(--tenant-secondary,#D4AF37)]/20 hover:bg-[var(--tenant-secondary,#D4AF37)]/30'
                : 'hover:bg-gray-100'
                }`}
              aria-label="Filtro senza glutine"
              aria-pressed={isGlutenFree}
            >
              <Image
                src="/gluten-free.png"
                alt="Filtro senza glutine"
                width={24}
                height={24}
                className="w-6 h-6"
              />
            </button>

            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
}

