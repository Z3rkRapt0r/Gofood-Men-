'use client';

import { useLanguage } from '@/contexts/LanguageContext';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1.5 shadow-md border border-gray-200">
      <button
        onClick={() => setLanguage('it')}
        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all touch-manipulation flex items-center gap-1.5 ${language === 'it'
            ? 'bg-[var(--tenant-primary,#8B0000)] text-white shadow-sm'
            : 'text-gray-600 hover:text-gray-900 active:bg-gray-100'
          }`}
        aria-label="Cambia lingua in Italiano"
      >
        <span className="text-base">🇮🇹</span>
        <span>IT</span>
      </button>
      <button
        onClick={() => setLanguage('en')}
        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all touch-manipulation flex items-center gap-1.5 ${language === 'en'
            ? 'bg-[var(--tenant-primary,#8B0000)] text-white shadow-sm'
            : 'text-gray-600 hover:text-gray-900 active:bg-gray-100'
          }`}
        aria-label="Switch language to English"
      >
        <span className="text-base">🇬🇧</span>
        <span>EN</span>
      </button>
    </div>
  );
}

