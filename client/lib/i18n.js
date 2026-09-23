import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import en from '@/locales/en';
import fr from '@/locales/fr';

const dictionaries = { en, fr };
export const LANGUAGES = ['en', 'fr'];
const STORAGE_KEY = 'lang';

const I18nContext = createContext(null);

function lookup(dict, key) {
  return key.split('.').reduce((node, part) => (node == null ? undefined : node[part]), dict);
}

export function I18nProvider({ children }) {
  // Always render English first so static HTML and hydration match,
  // then switch to the saved or browser language on the client.
  const [lang, setLangState] = useState('en');

  useEffect(() => {
    let initial = 'en';
    try {
      initial = localStorage.getItem(STORAGE_KEY) || (navigator.language?.startsWith('fr') ? 'fr' : 'en');
    } catch {}
    if (LANGUAGES.includes(initial)) setLangState(initial);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next) => {
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {}
  }, []);

  const t = useCallback(
    (key, vars) => {
      const value = lookup(dictionaries[lang], key) ?? lookup(en, key) ?? key;
      if (typeof value !== 'string' || !vars) return value;
      return value.replace(/\{(\w+)\}/g, (match, name) => (name in vars ? vars[name] : match));
    },
    [lang],
  );

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used inside <I18nProvider>');
  return context;
}
