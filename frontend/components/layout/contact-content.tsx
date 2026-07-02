"use client";

import { EnvelopeSimple } from "@phosphor-icons/react/dist/ssr";
import { Footer } from "@/components/landing/footer";
import { useDictionary } from "@/lib/i18n";
import { MarketingHeader } from "./marketing-header";

export function ContactContent() {
  const dict = useDictionary();

  return (
    <div className="flex min-h-screen flex-col">
      <MarketingHeader />
      <main className="flex-1 bg-white px-4 py-16 dark:bg-gray-950">
        <div className="animate-page-in container mx-auto max-w-3xl">
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-50">
            {dict.legal.contact.title}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
            {dict.legal.contact.description}
          </p>

          <a
            href="mailto:hello@feedstud.io"
            className="mt-8 inline-flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-5 py-4 text-sm font-medium text-gray-900 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50/30 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100 dark:hover:border-blue-800 dark:hover:bg-blue-500/5"
          >
            <span className="flex size-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              <EnvelopeSimple size={20} weight="bold" />
            </span>
            hello@feedstud.io
          </a>
        </div>
      </main>
      <Footer />
    </div>
  );
}
