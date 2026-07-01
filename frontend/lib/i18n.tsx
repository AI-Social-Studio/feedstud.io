"use client";

import {
  useCallback,
  useContext,
  useEffect,
  useSyncExternalStore,
} from "react";
import { dictionaries, type Dictionary, type Locale } from "@/dictionaries";
import { DEFAULT_LOCALE, LanguageContext, LOCALE_COOKIE_NAME } from "@/lib/language-context";

const STORAGE_KEY = "locale";
const listeners = new Set<() => void>();

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
    document.documentElement.setAttribute("data-locale-ready", "true");
  }, [locale]);

  return { locale, setLocale, dict: dictionaries[locale] };
}

export const LOCALE_INIT_SCRIPT = `(function(){try{var l=localStorage.getItem("${STORAGE_KEY}");if(l!=="pl"&&l!=="en"){l="${DEFAULT_LOCALE}"}document.documentElement.lang=l;document.cookie="${LOCALE_COOKIE_NAME}="+l+"; path=/; max-age=31536000; samesite=lax"}catch(e){}})();`;

export function useDictionary(): Dictionary {
  return useLanguage().dict;
}
