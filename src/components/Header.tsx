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
  mobileHeaderStyle = 'left',
  disableLanguageSwitcher = false
}: HeaderProps & { disableLanguageSwitcher?: boolean }) {
  // Ensure logoUrl is properly encoded to handle spaces
  const sanitizedLogoUrl = logoUrl?.replace(/ /g, '%20') || '/favicon.svg';
  const { isGlutenFree, toggleGlutenFilter } = useGlutenFilter();

  // Default positioning is 'fixed' for the real menu, but can be overridden (e.g. 'absolute' for previews)
  const positionClass = className || "fixed top-0 left-0 w-full z-50";

  return (
    <header className={`${positionClass} bg-[var(--tenant-header-bg,var(--tenant-surface,#FFFFFF))] text-[var(--tenant-primary,#8B0000)] transition-all duration-200 shadow-sm h-[72px]`}>
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
                  className={`p-2 rounded-lg transition-colors ${isGlutenFree ? 'bg-[#D4AF37]/40 hover:bg-[#D4AF37]/50' : 'hover:bg-gray-100'}`}
                  style={{ color: 'var(--tenant-header-text, var(--tenant-primary, #8B0000))' }}
                  aria-label="Filtro senza glutine"
                  aria-pressed={isGlutenFree}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="m2 22 10-10m4-4-1.17 1.17M3.47 12.53 5 11l1.53 1.53a3.5 3.5 0 0 1 0 4.94L5 19l-1.53-1.53a3.5 3.5 0 0 1 0-4.94M8 8l-.53.53a3.5 3.5 0 0 0 0 4.94L9 15l1.53-1.53c.55-.55.88-1.25.98-1.97m-.6-6.24c.15-.26.34-.51.56-.73L13 3l1.53 1.53a3.5 3.5 0 0 1 .28 4.62M20 2h2v2a4 4 0 0 1-4 4h-2V6a4 4 0 0 1 4-4" /><path d="M11.47 17.47 13 19l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L5 19l1.53-1.53a3.5 3.5 0 0 1 4.94 0M16 16l-.53.53a3.5 3.5 0 0 1-4.94 0L9 15l1.53-1.53a3.5 3.5 0 0 1 1.97-.98m6.24.6c.26-.15.51-.34.73-.56L21 11l-1.53-1.53a3.5 3.5 0 0 0-4.62-.28M2 2l20 20" /></svg>
                </button>
              </div>

              {/* Logo (Centro) */}
              <div className="flex-1 flex items-center justify-center px-2">
                <img src={sanitizedLogoUrl} alt={restaurantName} className="w-auto h-auto max-h-[56px] max-w-[180px] object-contain transition-all duration-200" />
              </div>

              {/* Lingua (Destra) */}
              <div className="w-12 flex justify-end">
                <LanguageSwitcher compact={true} disabled={disableLanguageSwitcher} />
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
                  className={`p-2 rounded-lg transition-colors ${isGlutenFree ? 'bg-[#D4AF37]/40 hover:bg-[#D4AF37]/50' : 'hover:bg-gray-100'}`}
                  style={{ color: 'var(--tenant-header-text, var(--tenant-primary, #8B0000))' }}
                  aria-label="Filtro senza glutine"
                  aria-pressed={isGlutenFree}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="m2 22 10-10m4-4-1.17 1.17M3.47 12.53 5 11l1.53 1.53a3.5 3.5 0 0 1 0 4.94L5 19l-1.53-1.53a3.5 3.5 0 0 1 0-4.94M8 8l-.53.53a3.5 3.5 0 0 0 0 4.94L9 15l1.53-1.53c.55-.55.88-1.25.98-1.97m-.6-6.24c.15-.26.34-.51.56-.73L13 3l1.53 1.53a3.5 3.5 0 0 1 .28 4.62M20 2h2v2a4 4 0 0 1-4 4h-2V6a4 4 0 0 1 4-4" /><path d="M11.47 17.47 13 19l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L5 19l1.53-1.53a3.5 3.5 0 0 1 4.94 0M16 16l-.53.53a3.5 3.5 0 0 1-4.94 0L9 15l1.53-1.53a3.5 3.5 0 0 1 1.97-.98m6.24.6c.26-.15.51-.34.73-.56L21 11l-1.53-1.53a3.5 3.5 0 0 0-4.62-.28M2 2l20 20" /></svg>
                </button>
                <LanguageSwitcher compact={false} disabled={disableLanguageSwitcher} />
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
                ? 'bg-[#D4AF37]/40 hover:bg-[#D4AF37]/50'
                : 'hover:bg-gray-100'
                }`}
              style={{ color: 'var(--tenant-header-text, var(--tenant-primary, #8B0000))' }}
              aria-label="Filtro senza glutine"
              aria-pressed={isGlutenFree}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="m2 22 10-10m4-4-1.17 1.17M3.47 12.53 5 11l1.53 1.53a3.5 3.5 0 0 1 0 4.94L5 19l-1.53-1.53a3.5 3.5 0 0 1 0-4.94M8 8l-.53.53a3.5 3.5 0 0 0 0 4.94L9 15l1.53-1.53c.55-.55.88-1.25.98-1.97m-.6-6.24c.15-.26.34-.51.56-.73L13 3l1.53 1.53a3.5 3.5 0 0 1 .28 4.62M20 2h2v2a4 4 0 0 1-4 4h-2V6a4 4 0 0 1 4-4" /><path d="M11.47 17.47 13 19l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L5 19l1.53-1.53a3.5 3.5 0 0 1 4.94 0M16 16l-.53.53a3.5 3.5 0 0 1-4.94 0L9 15l1.53-1.53a3.5 3.5 0 0 1 1.97-.98m6.24.6c.26-.15.51-.34.73-.56L21 11l-1.53-1.53a3.5 3.5 0 0 0-4.62-.28M2 2l20 20" /></svg>
            </button>

            <LanguageSwitcher disabled={disableLanguageSwitcher} />
          </div>
        </div>
      </div>
    </header>
  );
}

