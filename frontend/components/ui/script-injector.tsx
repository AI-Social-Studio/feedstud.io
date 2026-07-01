"use client";

import { useInsertionEffect } from "react";
import { THEME_INIT_SCRIPT } from "@/lib/theme";
import { LOCALE_INIT_SCRIPT } from "@/lib/i18n";

export function ScriptInjector() {
  useInsertionEffect(() => {
    const s = document.createElement("script");
    s.textContent = THEME_INIT_SCRIPT + LOCALE_INIT_SCRIPT;
    document.head.appendChild(s);
    s.remove();
  }, []);

  return null;
}
