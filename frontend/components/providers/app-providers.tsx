"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import type { ReactNode } from "react";
import type { Locale } from "@/dictionaries";
import { LanguageProvider } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";

export function AppProviders({ children, initialLocale }: { children: ReactNode; initialLocale: Locale }) {
  const { theme } = useTheme();

  return (
    <LanguageProvider initialLocale={initialLocale}>
      <ClerkProvider
        appearance={{
          theme: theme === "dark" ? dark : undefined,
          variables: { colorPrimary: "#0b58f6" },
        }}
      >
        {children}
      </ClerkProvider>
    </LanguageProvider>
  );
}
