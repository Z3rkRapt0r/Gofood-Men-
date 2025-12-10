'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: any;
  }
}

interface LanguageSwitcherProps {
  compact?: boolean;
}

export default function LanguageSwitcher({ compact = false }: LanguageSwitcherProps) {
  const [currentLang, setCurrentLang] = useState('it');

  // Flag per evitare loop di reload
  const [isChanging, setIsChanging] = useState(false);

  useEffect(() => {
    // Initialize Google Translate
    window.googleTranslateElementInit = () => {
      if (window.google?.translate?.TranslateElement) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'it',
            includedLanguages: 'it,en',
            autoDisplay: false,
          },
          'google_translate_element'
        );
      }
    };

    const scriptId = 'google-translate-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.type = 'text/javascript';
      script.async = true;
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      document.body.appendChild(script);
    } else if (window.google && window.google.translate) {
      // Re-init if script already loaded (e.g. navigation)
      window.googleTranslateElementInit();
    }

    // Check existing cookie
    const match = document.cookie.match(/googtrans=\/it\/([a-z]{2})/);
    if (match) {
      setCurrentLang(match[1]);
    }
  }, []);

  const handleLanguageChange = (lang: string) => {
    if (lang === currentLang) return;
    setIsChanging(true);

    if (lang === 'it') {
      // Aggressive cookie clearing strategies
      const domain = window.location.hostname;
      const domainParts = domain.split('.');

      // 1. Clear for current domain (localhost or specific host)
      document.cookie = `googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
      document.cookie = `googtrans=; path=/; domain=${domain}; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;

      // 2. Clear for root domain (e.g. .gofood.it) if applicable
      if (domainParts.length > 1) {
        const rootDomain = `.${domainParts.slice(-2).join('.')}`;
        document.cookie = `googtrans=; path=/; domain=${rootDomain}; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
      }

      // 3. Clear specifically for .localhost for development
      if (domain === 'localhost') {
        document.cookie = `googtrans=; path=/; domain=localhost; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
      }

    } else {
      // Set google translate cookie normally
      const cookieValue = `/it/${lang}`;
      document.cookie = `googtrans=${cookieValue}; path=/; domain=${window.location.hostname}`;
      document.cookie = `googtrans=${cookieValue}; path=/;`;
    }

    setCurrentLang(lang);
    window.location.reload();
  };

  return (
    <div className={`flex items-center gap-0.5 bg-white/90 backdrop-blur-sm rounded-full shadow-sm border border-gray-200 ${compact ? 'p-0.5' : 'px-2 py-1.5'}`}>
      {/* Hidden container for Google's widget */}
      <div id="google_translate_element" className="hidden"></div>

      <button
        type="button"
        onClick={() => handleLanguageChange('it')}
        className={`rounded-full transition-all touch-manipulation flex items-center justify-center ${compact ? 'w-8 h-8' : 'px-3 py-1.5 text-sm gap-1.5'} ${currentLang === 'it'
          ? 'bg-[var(--tenant-primary,#8B0000)] text-[var(--tenant-background,#FFFFFF)] shadow-sm'
          : 'text-gray-400 hover:text-gray-900'
          }`}
        aria-label="Cambia lingua in Italiano"
        title="Italiano"
        disabled={isChanging}
      >
        <span className={compact ? 'text-lg leading-none' : 'text-base'}>🇮🇹</span>
        {!compact && <span>IT</span>}
      </button>

      <button
        type="button"
        onClick={() => handleLanguageChange('en')}
        className={`rounded-full transition-all touch-manipulation flex items-center justify-center ${compact ? 'w-8 h-8' : 'px-3 py-1.5 text-sm gap-1.5'} ${currentLang === 'en'
          ? 'bg-[var(--tenant-primary,#8B0000)] text-[var(--tenant-background,#FFFFFF)] shadow-sm'
          : 'text-gray-400 hover:text-gray-900'
          }`}
        aria-label="Switch language to English"
        title="English"
        disabled={isChanging}
      >
        <span className={compact ? 'text-lg leading-none' : 'text-base'}>🇬🇧</span>
        {!compact && <span>EN</span>}
      </button>
    </div>
  );
}
