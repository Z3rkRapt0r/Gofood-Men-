import { useLanguage } from '@/contexts/LanguageContext';
import { Translation } from '@/types/menu';

export function useTranslation() {
  const { language } = useLanguage();

  const t = (translation: Translation): string => {
    // If exact language match exists (and is a valid key), use it
    if (language === 'it' || language === 'en') {
      return translation[language];
    }
    // Fallback order: English -> Italian -> First available
    return translation.en || translation.it || '';
  };

  return { t, language };
}

