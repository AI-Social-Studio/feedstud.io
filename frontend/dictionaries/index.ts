import { en } from "./en";
import { pl } from "./pl";
import type { Dictionary } from "./types";

export type Locale = "pl" | "en";

export const dictionaries: Record<Locale, Dictionary> = { pl, en };

export const LOCALES: Locale[] = ["pl", "en"];

export function isLocale(value: string): value is Locale {
  return value === "pl" || value === "en";
}

export type { Dictionary };
