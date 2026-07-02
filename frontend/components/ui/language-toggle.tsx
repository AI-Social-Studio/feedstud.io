"use client";

import { CaretDown, Check } from "@phosphor-icons/react/dist/ssr";
import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/dictionaries";
import { useLanguage } from "@/lib/i18n";

const LABELS: Record<Locale, string> = { pl: "PL", en: "EN" };
const OPTIONS: Locale[] = ["pl", "en"];

export function LanguageToggle({ direction = "up" }: { direction?: "up" | "down" }) {
  const { locale, setLocale } = useLanguage();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="inline-flex h-9 items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 text-xs font-semibold text-gray-600 transition-all duration-150 hover:scale-105 hover:bg-gray-50 hover:text-gray-900 active:scale-95 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
      >
        {LABELS[locale]}
        <CaretDown
          size={12}
          weight="bold"
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open ? (
        <div
          role="listbox"
          className={`animate-page-in absolute left-0 z-20 w-24 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-800 dark:bg-gray-900 ${
            direction === "down" ? "top-full mt-2" : "bottom-full mb-2"
          }`}
        >
          {OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              role="option"
              aria-selected={locale === option}
              onClick={() => {
                setLocale(option);
                setOpen(false);
              }}
              className="flex w-full items-center justify-between px-3 py-1.5 text-left text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              {LABELS[option]}
              {locale === option ? (
                <Check size={12} weight="bold" className="text-blue-600 dark:text-blue-400" />
              ) : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
