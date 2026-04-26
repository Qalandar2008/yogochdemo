import { useState, useEffect, useCallback } from 'react';
import { useRefresh } from '../contexts/RefreshContext';
import uz from '../locales/uz.json';
import uzCyrillic from '../locales/uz_cyrl.json';

const translations = {
  uz,
  uz_cyrl: uzCyrillic
};

const LANGUAGE_KEY = 'yogoch_language';

export const useTranslation = () => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem(LANGUAGE_KEY) || 'uz';
  });

  const [t, setT] = useState(translations[language]);
  const { triggerRefresh, refreshTrigger } = useRefresh();

  useEffect(() => {
    setT(translations[language]);
    localStorage.setItem(LANGUAGE_KEY, language);
    // Trigger refresh when language changes
    setTimeout(() => triggerRefresh('language'), 50);
  }, [language, triggerRefresh]);

  // Keep all hook instances in sync (language selector, navbar, pages, etc.)
  useEffect(() => {
    const saved = localStorage.getItem(LANGUAGE_KEY) || 'uz';
    if (saved !== language && translations[saved]) {
      setLanguage(saved);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger]);

  // Sync across tabs/windows
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== LANGUAGE_KEY) return;
      const next = e.newValue || 'uz';
      if (next !== language && translations[next]) {
        setLanguage(next);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [language]);

  const setLang = useCallback((lang) => {
    if (translations[lang]) {
      setLanguage(lang);
    }
  }, []);

  const translate = useCallback((key) => {
    const keys = key.split('.');
    let value = t;
    
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) return key;
    }
    
    return value;
  }, [t]);

  return {
    t: translate,
    language,
    setLanguage: setLang,
    languages: [
      { code: 'uz', name: 'O\'zbek tili (Lotin)' },
      { code: 'uz_cyrl', name: 'Ўзбек тили (Кирил)' }
    ]
  };
};
