"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import type { ReactNode } from "react";
import { useTheme } from "@/lib/theme";

export function AppProviders({ children }: { children: ReactNode }) {
  const { theme } = useTheme();

  return (
    <ClerkProvider
      appearance={{
        theme: theme === "dark" ? dark : undefined,
        variables: { colorPrimary: "#0b58f6" },
      }}
    >
      {children}
    </ClerkProvider>
  );
}
