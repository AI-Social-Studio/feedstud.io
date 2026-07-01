"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { dictionaries, type Dictionary, type Locale } from "@/dictionaries";

const STORAGE_KEY = "locale";
const DEFAULT_LOCALE: Locale = "pl";
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

function getServerSnapshot(): Locale {
  return DEFAULT_LOCALE;
}

export function useLanguage(): { locale: Locale; setLocale: (locale: Locale) => void; dict: Dictionary } {
  const locale = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setLocale = useCallback((next: Locale) => {
    window.localStorage.setItem(STORAGE_KEY, next);
    document.documentElement.lang = next;
    emitChange();
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return { locale, setLocale, dict: dictionaries[locale] };
}

export const LOCALE_INIT_SCRIPT = `(function(){try{var l=localStorage.getItem("${STORAGE_KEY}");if(l!=="pl"&&l!=="en"){l="${DEFAULT_LOCALE}"}document.documentElement.lang=l}catch(e){}})();`;

export function useDictionary(): Dictionary {
  return useLanguage().dict;
}
