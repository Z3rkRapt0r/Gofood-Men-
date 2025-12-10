'use client';

/* eslint-disable @next/next/no-img-element */

import React from 'react';
import Image from 'next/image';
import LanguageSwitcher from './LanguageSwitcher';
import { useGlutenFilter } from '@/contexts/GlutenFilterContext';

interface HeaderProps {
  restaurantName?: string;
  logoUrl?: string;
  forceMobile?: boolean;
  logoHeight?: number;
  className?: string;
  mobileHeaderStyle?: 'center' | 'left';
}

export default function Header({
  restaurantName = 'Menu Digitale',
  logoUrl = '/favicon.svg',
  forceMobile = false,
  logoHeight = 40,
  className,
  mobileHeaderStyle = 'left'
}: HeaderProps) {
  // Ensure logoUrl is properly encoded to handle spaces
  const sanitizedLogoUrl = logoUrl?.replace(/ /g, '%20') || '/favicon.svg';
  const { isGlutenFree, toggleGlutenFilter } = useGlutenFilter();

  // Default positioning is 'fixed' for the real menu, but can be overridden (e.g. 'absolute' for previews)
  const positionClass = className || "fixed top-0 left-0 w-full z-50";

  return (
    <header className={`${positionClass} bg-[var(--tenant-surface,#FFFFFF)] transition-all duration-200 shadow-sm h-[72px]`}>
      <div className="container mx-auto px-4 h-full">
        {/* Layout mobile: logo sx, filtri dx */}
        {/* Layout mobile: filtro sx, logo centro, lingua dx */}
        <div className={`flex items-center justify-between h-full relative ${forceMobile ? 'w-full' : 'md:hidden'}`}>

          {mobileHeaderStyle === 'center' ? (
            /* --- STYLE CURRENT (CENTER) --- */
            <>
              {/* Pulsante filtro celiaci (Sinistra) */}
              <div className="w-12 flex justify-start">
                <button
                  type="button"
                  onClick={toggleGlutenFilter}
                  className={`p-2 rounded-lg transition-colors ${isGlutenFree ? 'bg-[var(--tenant-secondary,#D4AF37)]/20 hover:bg-[var(--tenant-secondary,#D4AF37)]/30' : 'hover:bg-gray-100'}`}
                  aria-label="Filtro senza glutine"
                  aria-pressed={isGlutenFree}
                >
                  <Image src="/gluten-free.png" alt="Filtro senza glutine" width={20} height={20} className="w-5 h-5" />
                </button>
              </div>

              {/* Logo (Centro) */}
              <div className="flex-1 flex items-center justify-center px-2">
                <img src={sanitizedLogoUrl} alt={restaurantName} className="w-auto h-auto max-h-[56px] max-w-[180px] object-contain transition-all duration-200" />
              </div>

              {/* Lingua (Destra) */}
              <div className="w-12 flex justify-end">
                <LanguageSwitcher compact={true} />
              </div>
            </>
          ) : (
            /* --- STYLE NEW (LEFT) --- */
            <>
              {/* Logo (Sinistra) */}
              <div className="flex-1 flex justify-start items-center">
                <img src={sanitizedLogoUrl} alt={restaurantName} className="w-auto h-auto max-h-[56px] max-w-[150px] object-contain transition-all duration-200 object-left" />
              </div>

              {/* Controlli (Destra) - Uniti */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleGlutenFilter}
                  className={`p-2 rounded-lg transition-colors ${isGlutenFree ? 'bg-[var(--tenant-secondary,#D4AF37)]/20 hover:bg-[var(--tenant-secondary,#D4AF37)]/30' : 'hover:bg-gray-100'}`}
                  aria-label="Filtro senza glutine"
                  aria-pressed={isGlutenFree}
                >
                  <Image src="/gluten-free.png" alt="Filtro senza glutine" width={20} height={20} className="w-5 h-5" />
                </button>
                <LanguageSwitcher compact={false} />
              </div>
            </>
          )}

        </div>

        {/* Layout desktop: logo centrato, filtri dx */}
        <div className={`hidden items-center justify-between h-full relative ${forceMobile ? '' : 'md:flex'}`}>
          {/* Sotto-container per bilanciare i pulsanti a destra (vuoto a sx se non serve) */}
          <div className="flex-1 flex justify-start">
            {/* Optional: Left elements */}
          </div>

          {/* Logo centrato ASSOLUTO */}
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-[280px] h-full pointer-events-none">
            <img
              src={sanitizedLogoUrl}
              alt={restaurantName}
              className="w-auto h-auto max-h-[64px] max-w-full object-contain transition-all duration-200"
            />
          </div>

          {/* Gruppo controlli a destra */}
          <div className="flex-1 flex items-center justify-end gap-3 z-10">
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

