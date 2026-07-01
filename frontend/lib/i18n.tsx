"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { dictionaries, type Dictionary, type Locale } from "@/dictionaries";

const STORAGE_KEY = "locale";
export const LOCALE_COOKIE_NAME = "locale";
const DEFAULT_LOCALE: Locale = "pl";
const listeners = new Set<() => void>();
const LanguageContext = createContext<Locale>(DEFAULT_LOCALE);

function emitChange() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): Locale {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "pl" || stored === "en" ? stored : DEFAULT_LOCALE;
}

export function LanguageProvider({ children, initialLocale }: { children: ReactNode; initialLocale: Locale }) {
  return <LanguageContext.Provider value={initialLocale}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): { locale: Locale; setLocale: (locale: Locale) => void; dict: Dictionary } {
  const initialLocale = useContext(LanguageContext);
  const locale = useSyncExternalStore(subscribe, getSnapshot, () => initialLocale);

  const setLocale = useCallback((next: Locale) => {
    window.localStorage.setItem(STORAGE_KEY, next);
    document.cookie = `${LOCALE_COOKIE_NAME}=${next}; path=/; max-age=31536000; samesite=lax`;
    document.documentElement.lang = next;
    emitChange();
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return { locale, setLocale, dict: dictionaries[locale] };
}

export const LOCALE_INIT_SCRIPT = `(function(){try{var l=localStorage.getItem("${STORAGE_KEY}");if(l!=="pl"&&l!=="en"){l="${DEFAULT_LOCALE}"}document.documentElement.lang=l;document.cookie="${LOCALE_COOKIE_NAME}="+l+"; path=/; max-age=31536000; samesite=lax"}catch(e){}})();`;

export function useDictionary(): Dictionary {
  return useLanguage().dict;
}
