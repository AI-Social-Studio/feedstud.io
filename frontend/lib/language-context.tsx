"use client";

import { createContext, type ReactNode } from "react";
import type { Locale } from "@/dictionaries";

export const DEFAULT_LOCALE: Locale = "pl";
export const LOCALE_COOKIE_NAME = "locale";
export const LanguageContext = createContext<Locale>(DEFAULT_LOCALE);

export function LanguageProvider({ children, initialLocale }: { children: ReactNode; initialLocale: Locale }) {
  return <LanguageContext.Provider value={initialLocale}>{children}</LanguageContext.Provider>;
}
