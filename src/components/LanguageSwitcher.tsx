'use client';

import { useLanguage } from '@/contexts/LanguageContext';

interface LanguageSwitcherProps {
  compact?: boolean;
}

export default function LanguageSwitcher({ compact = false }: LanguageSwitcherProps) {
  const { language, setLanguage } = useLanguage();

  return (
    <div className={`flex items-center gap-0.5 bg-white/90 backdrop-blur-sm rounded-full shadow-sm border border-gray-200 ${compact ? 'p-0.5' : 'px-2 py-1.5'}`}>
      <button
        type="button"
        onClick={() => setLanguage('it')}
        className={`rounded-full transition-all touch-manipulation flex items-center justify-center ${compact ? 'w-8 h-8' : 'px-3 py-1.5 text-sm gap-1.5'} ${language === 'it'
          ? 'bg-[var(--tenant-primary,#8B0000)] text-[var(--tenant-background,#FFFFFF)] shadow-sm'
          : 'text-gray-400 hover:text-gray-900'
          }`}
        aria-label="Cambia lingua in Italiano"
        title="Italiano"
      >
        <span className={compact ? 'text-lg leading-none' : 'text-base'}>🇮🇹</span>
        {!compact && <span>IT</span>}
      </button>
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`rounded-full transition-all touch-manipulation flex items-center justify-center ${compact ? 'w-8 h-8' : 'px-3 py-1.5 text-sm gap-1.5'} ${language === 'en'
          ? 'bg-[var(--tenant-primary,#8B0000)] text-[var(--tenant-background,#FFFFFF)] shadow-sm'
          : 'text-gray-400 hover:text-gray-900'
          }`}
        aria-label="Switch language to English"
        title="English"
      >
        <span className={compact ? 'text-lg leading-none' : 'text-base'}>🇬🇧</span>
        {!compact && <span>EN</span>}
      </button>
    </div>
  );
}
