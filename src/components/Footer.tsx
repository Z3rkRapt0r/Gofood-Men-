'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';

import { FooterData } from '@/types/menu';

interface FooterProps {
  footerData?: FooterData;
  restaurantName?: string;
  logoUrl?: string;
  slug?: string;
}

export default function Footer({ footerData, restaurantName, logoUrl, slug }: FooterProps) {
  const { language } = useTranslation();

  // Default locations if no footer data is provided
  const defaultLocations: { city: string; address: string; phone?: string }[] = [];

  const locations = footerData?.locations && footerData.locations.length > 0
    ? footerData.locations
    : defaultLocations;

  const showBrandColumn = footerData?.show_brand_column ?? true;
  const links = footerData?.links || [];
  const socials = footerData?.socials || [];

  return (
    <footer className="bg-gradient-to-b from-[var(--tenant-surface,#FFFFFF)] to-[var(--tenant-background,#FFF8E7)] border-t-2 border-[var(--tenant-secondary,#D4AF37)] mt-16">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand Section */}
          {showBrandColumn && (
            <div className="text-center md:text-left">
              <Image
                src={logoUrl || "/icon.svg"}
                alt={`${restaurantName || 'Menu Digitale'} Logo`}
                width={150}
                height={50}
                className="h-12 w-auto mx-auto md:mx-0 mb-3"
              />
              <p className="text-sm text-[var(--tenant-text-secondary,#4B5563)] mb-4">
                {language === 'it'
                  ? 'Il tuo Menu Digitale'
                  : 'Your Digital Menu'}
              </p>
              <p className="text-sm text-[var(--tenant-text,#171717)] leading-relaxed mb-4">
                {footerData?.brand_description?.[language as 'it' | 'en'] || footerData?.brand_description?.it || (language === 'it'
                  ? 'Scopri i nostri piatti e le nostre specialità.'
                  : 'Discover our dishes and specialties.')}
              </p>
            </div>
          )}

          {/* Le Nostre Sedi */}
          <div className="text-center md:text-left">
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
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Links Utili */}
          <div className="text-center md:text-left">
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
              {links.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.url}
                    className="inline-flex items-center gap-2 text-[var(--tenant-text-secondary,#4B5563)] hover:text-[var(--tenant-primary,#8B0000)] transition-colors"
                  >
                    <span className="text-lg">🔗</span>
                    {link.label[language as 'it' | 'en'] || link.label.it}
                  </Link>
                </li>
              ))}
              {/* Default links if no custom links provided and not using footerData (legacy fallback) */}
              {!footerData && (
                <>
                  <li>
                    <Link
                      href="/"
                      className="inline-flex items-center gap-2 text-[var(--tenant-text-secondary,#4B5563)] hover:text-[var(--tenant-primary,#8B0000)] transition-colors"
                    >
                      <span className="text-lg">🍝</span>
                      {language === 'it' ? 'Menu' : 'Menu'}
                    </Link>
                  </li>
                </>
              )}
            </ul>

            {/* Social Media */}
            <div>
              <h5 className="text-sm font-semibold text-[var(--tenant-text,#171717)] mb-3">
                {language === 'it' ? 'Seguici' : 'Follow Us'}
              </h5>
              <div className="flex gap-3 justify-center md:justify-start">
                {socials.length > 0 ? (
                  socials.map((social, index) => (
                    <a
                      key={index}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-2xl hover:text-[var(--tenant-primary,#8B0000)] transition-colors"
                      aria-label={social.platform}
                    >
                      {social.platform === 'facebook' && '📘'}
                      {social.platform === 'instagram' && '📸'}
                      {social.platform === 'tripadvisor' && '🦉'}
                      {social.platform === 'website' && '🌐'}
                      {social.platform === 'other' && '🔗'}
                    </a>
                  ))
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
          <p className="text-sm text-[var(--tenant-text-secondary,#4B5563)]">
            {language === 'it'
              ? 'Chiamare il cameriere per ordinare'
              : 'Call the waiter to order'}
          </p>
          <p className="text-xs text-[var(--tenant-text-secondary,#4B5563)]">
            © {new Date().getFullYear()} {restaurantName || 'Gofood Menù'} - {language === 'it' ? 'Tutti i diritti riservati' : 'All rights reserved'}
          </p>
        </div>
      </div>
    </footer>
  );
}

