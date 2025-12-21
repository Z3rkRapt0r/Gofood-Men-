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
            includedLanguages: 'it,en,es,fr,ar,zh-CN',
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
        <div className={`flex items-center justify-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-sm border border-gray-200 ${compact ? 'p-1' : 'px-3 py-1.5'}`}>
          <span className="text-lg leading-none">🇮🇹</span>
          <Languages className="w-4 h-4 text-gray-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-50">
      {/* Hidden container for Google's widget */}
      <div id="google_translate_element" className="hidden"></div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            disabled={isChanging}
            className={`flex items-center justify-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-sm border border-gray-200 transition-all hover:bg-gray-50 ${compact ? 'p-1' : 'px-3 py-1.5'}`}
            aria-label="Select Language"
          >
            <span className="text-lg leading-none">{currentFlag}</span>
            <Languages className="w-4 h-4 text-gray-500" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {LANGUAGES.map((lang) => (
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
  );
}
