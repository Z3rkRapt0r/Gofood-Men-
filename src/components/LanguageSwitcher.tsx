import { useEffect, useState } from 'react';
import { Languages } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' }, // Using Saudi Arabia flag for Arabic generic
  { code: 'zh-CN', label: '中文', flag: '🇨🇳' }, // Google Translate uses zh-CN for Chinese Simplified
];

export default function LanguageSwitcher({ compact = false }: LanguageSwitcherProps) {
  const [currentLang, setCurrentLang] = useState('it');
  const [isChanging, setIsChanging] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Initialize Google Translate
    window.googleTranslateElementInit = () => {
      if (window.google?.translate?.TranslateElement) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'it',
            includedLanguages: 'it,en,de,es,fr,ar,zh-CN',
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
    const match = document.cookie.match(/googtrans=\/it\/([a-zA-Z-]+)/);
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

  const currentFlag = LANGUAGES.find(l => l.code === currentLang)?.flag || '🇮🇹';

  if (!mounted) {
    return (
      <div className="relative z-50">
        <div className={`flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1.5 shadow-md border border-gray-200 ${compact ? 'scale-90' : ''}`}>
          {/* Italian Button (Fixed - Default Active) */}
          <button
            disabled
            className="px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5 bg-[#8B0000] text-white shadow-sm"
          >
            <span className="text-base">🇮🇹</span>
            <span>IT</span>
          </button>

          {/* Dropdown Button (Default Inactive) */}
          <button
            disabled
            className="px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5 text-gray-600"
          >
            <span className="text-base">🇬🇧</span>
            <span>EN</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-50">
      {/* Hidden container for Google's widget */}
      <div id="google_translate_element" className="hidden"></div>

      <div className={`flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1.5 shadow-md border border-gray-200 ${compact ? 'scale-90' : ''}`}>
        {/* Italian Button (Fixed) */}
        <button
          onClick={() => handleLanguageChange('it')}
          disabled={isChanging}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all touch-manipulation flex items-center gap-1.5 ${currentLang === 'it'
            ? 'bg-[#8B0000] text-white shadow-sm'
            : 'text-gray-600 hover:text-gray-900 active:bg-gray-100'
            }`}
          aria-label="Passa all'italiano"
          aria-pressed={currentLang === 'it'}
        >
          <span className="text-base">🇮🇹</span>
          <span>IT</span>
        </button>

        {/* Dropdown for other languages */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              disabled={isChanging}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all touch-manipulation flex items-center gap-1.5 ${currentLang !== 'it'
                ? 'bg-[#8B0000] text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 active:bg-gray-100'
                }`}
              aria-label="Scegli altra lingua"
              aria-pressed={currentLang !== 'it'}
            >
              <span className="text-base">
                {currentLang === 'it' ? '🇬🇧' : currentFlag}
              </span>
              <span>
                {currentLang === 'it'
                  ? 'EN'
                  : (LANGUAGES.find(l => l.code === currentLang)?.label === 'English' ? 'EN' : currentLang.toUpperCase().slice(0, 2))
                }
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {LANGUAGES.filter(lang => lang.code !== 'it').map((lang) => (
              <DropdownMenuItem
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className="cursor-pointer gap-2"
              >
                <span className="text-lg">{lang.flag}</span>
                <span>{lang.label}</span>
                {currentLang === lang.code && (
                  <span className="ml-auto text-xs text-muted-foreground">Active</span>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
