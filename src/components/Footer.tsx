'use client';

/* eslint-disable @next/next/no-img-element */

import React from 'react';
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';
import { SocialIcon } from './SocialIcon';

import { FooterData, FooterLocation } from '@/types/menu';

interface FooterProps {
  footerData?: FooterData;
  restaurantName?: string;
  logoUrl?: string;
  slug?: string;
  forceMobile?: boolean;
}

export default function Footer({ footerData, restaurantName, logoUrl, slug, forceMobile = false }: FooterProps) {
  const { language } = useTranslation();
  // Ensure logoUrl is properly encoded to handle spaces
  const sanitizedLogoUrl = logoUrl?.replace(/ /g, '%20') || '/favicon.svg';

  // Default locations if no footer data is provided
  const defaultLocations: FooterLocation[] = [];

  const locations = footerData?.locations && footerData.locations.length > 0
    ? footerData.locations
    : defaultLocations;

  const showBrandColumn = footerData?.show_brand_column ?? true;
  const socials = footerData?.socials || [];

  return (
    <footer className="bg-gradient-to-b from-[var(--tenant-surface,#FFFFFF)] to-[var(--tenant-background,#FFF8E7)] border-t-2 border-[var(--tenant-secondary,#D4AF37)] mt-16">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Main Footer Content */}
        <div className={`grid grid-cols-2 gap-8 mb-8 ${forceMobile ? '' : 'md:grid-cols-3'}`}>
          {/* Brand Section */}
          {showBrandColumn && (
            <div className={`col-span-2 text-center ${forceMobile ? '' : 'md:col-span-1 md:text-left'}`}>
              <img
                src={sanitizedLogoUrl}
                alt={`${restaurantName || 'Menu Digitale'} Logo`}
                className={`h-12 w-auto mx-auto mb-3 object-contain ${forceMobile ? '' : 'md:mx-0'}`}
              />
              <p className="text-sm text-[var(--tenant-text,#171717)] leading-relaxed mb-4">
                {footerData?.brand_description?.[language as 'it' | 'en'] || footerData?.brand_description?.it || (language === 'it'
                  ? 'Scopri i nostri piatti e le nostre specialità.'
                  : 'Discover our dishes and specialties.')}
              </p>
            </div>
          )}

          {/* Le Nostre Sedi */}
          <div className={`text-center ${forceMobile ? '' : 'md:text-left'}`}>
            <h4 className="text-lg font-bold text-[var(--tenant-text,#171717)] mb-4">
              {language === 'it' ? 'Le Nostre Sedi' : 'Our Locations'}
            </h4>
            {locations.length > 0 && (
              <ul className="space-y-3 text-sm text-[var(--tenant-text-secondary,#4B5563)] mb-4">
                {locations.map((location, index) => (
                  <li key={index} className="leading-relaxed">
                    <span className="font-semibold text-[var(--tenant-primary,#8B0000)]">
                      {location.city}
                    </span>
                    <br />
                    <span className="text-xs block">{location.address}</span>
                    {location.phone && (
                      <span className="text-xs block">📞 {location.phone}</span>
                    )}
                    {location.opening_hours && (
                      <span className="text-xs block">🕒 {location.opening_hours}</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Links Utili - REMOVED */}
          <div className={`text-center ${forceMobile ? '' : 'md:text-left'}`}>
            <h4 className="text-lg font-bold text-[var(--tenant-text,#171717)] mb-4">
              {language === 'it' ? 'Informazioni' : 'Information'}
            </h4>
            <ul className="space-y-3 mb-6">
              <li>
                <Link
                  href={slug ? `/${slug}/allergeni` : '/allergeni'}
                  className="inline-flex items-center gap-2 text-[var(--tenant-primary,#8B0000)] hover:brightness-75 font-medium transition-all"
                >
                  <span className="text-lg">🛡️</span>
                  {language === 'it' ? 'Allergeni' : 'Allergens'}
                </Link>
              </li>
            </ul>

            {/* Social Media */}
            <div>
              <h5 className="text-sm font-semibold text-[var(--tenant-text,#171717)] mb-3">
                {language === 'it' ? 'Seguici' : 'Follow Us'}
              </h5>
              <div className={`flex gap-3 justify-center ${forceMobile ? '' : 'md:justify-start'}`}>
                {socials.length > 0 ? (
                  socials.map((social, index) => {
                    // Ensure URL is absolute
                    const rawUrl = social.url || '';
                    const absoluteUrl = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`;

                    return (
                      <a
                        key={index}
                        href={absoluteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--tenant-text-secondary,#4B5563)] hover:text-[var(--tenant-primary,#8B0000)] transition-colors hover:scale-110 transform duration-200"
                        aria-label={social.platform}
                      >
                        <SocialIcon platform={social.platform} className="w-6 h-6" />
                      </a>
                    );
                  })
                ) : (
                  // Default socials if no custom socials provided
                  null
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-300 my-6"></div>

        {/* Bottom Footer */}
        <div className="text-center space-y-2">
          <p className="text-xs text-[var(--tenant-text-secondary,#4B5563)]">
            &copy; {new Date().getFullYear()} Go!Food | <a href="mailto:info@gofoodmenu.it" className="hover:text-[var(--tenant-primary,#8B0000)]">info@gofoodmenu.it</a> | <a href="https://www.gofoodmenu.it" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--tenant-primary,#8B0000)]">gofoodmenu.it</a>
          </p>
          <div className="flex justify-center gap-4 text-xs">
            <a href="https://www.iubenda.com/privacy-policy/23100081" className="iubenda-white iubenda-noiframe iubenda-embed iubenda-noiframe hover:text-[var(--tenant-primary,#8B0000)] transition-colors" title="Privacy Policy">Privacy Policy</a>
            <a href="https://www.iubenda.com/privacy-policy/23100081/cookie-policy" className="iubenda-white iubenda-noiframe iubenda-embed iubenda-noiframe hover:text-[var(--tenant-primary,#8B0000)] transition-colors" title="Cookie Policy">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

