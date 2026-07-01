import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Inter, Geist_Mono } from "next/font/google";
import { AppProviders } from "@/components/providers/app-providers";
import { InlineScript } from "@/components/ui/inline-script";
import { isLocale } from "@/dictionaries";
import { LOCALE_COOKIE_NAME, LOCALE_INIT_SCRIPT } from "@/lib/i18n";
import { THEME_INIT_SCRIPT } from "@/lib/theme";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "socialstudio.ai — AI-Powered Content Repurposing",
  description:
    "Paste your raw ideas. Pick a platform. Get a finished post tailored for LinkedIn, Instagram, or X.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get(LOCALE_COOKIE_NAME)?.value;
  const initialLocale = localeCookie && isLocale(localeCookie) ? localeCookie : "pl";

  return (
    <html
      lang={initialLocale}
      data-theme="light"
      suppressHydrationWarning
      className={`${inter.variable} ${geistMono.variable} min-h-full antialiased`}
    >
      <head>
        <InlineScript html={THEME_INIT_SCRIPT} />
        <InlineScript html={LOCALE_INIT_SCRIPT} />
      </head>
      <body className="min-h-screen">
        <AppProviders initialLocale={initialLocale}>{children}</AppProviders>
      </body>
    </html>
  );
}
