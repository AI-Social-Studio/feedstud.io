"use client";

import { Footer } from "@/components/landing/footer";
import { useDictionary } from "@/lib/i18n";
import { MarketingHeader } from "./marketing-header";
import { EnvelopeSimpleIcon } from "@phosphor-icons/react";

export function ContactContent() {
  const dict = useDictionary();

  return (
    <div className="flex min-h-screen flex-col">
      <MarketingHeader />
      <main className="flex-1 bg-white px-4 py-16 dark:bg-gray-950">
        <div className="animate-page-in container mx-auto max-w-3xl text-center">
          <div className="mb-16">
            <h1 className="text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl dark:text-gray-50">
              {dict.legal.contact.title}
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-lg text-gray-500 dark:text-gray-400">
              {dict.legal.contact.description}
            </p>
          </div>

          <div className="mt-12 flex justify-center">
            <div className="w-full max-w-md rounded-3xl border border-gray-100 bg-gray-50/50 p-2 transition-all hover:border-gray-200 hover:bg-gray-50 hover:shadow-sm dark:border-gray-800 dark:bg-gray-900/30 dark:hover:border-gray-800 dark:hover:bg-gray-900/50">
              <a
                href="mailto:hello@feedstud.io"
                className="group flex items-center gap-5 rounded-2xl bg-white p-4 pr-6 shadow-sm transition-all hover:shadow-md dark:bg-gray-950 dark:hover:bg-gray-900"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:group-hover:bg-blue-500/20">
                  <EnvelopeSimpleIcon size={26} weight="regular" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-lg font-semibold tracking-tight text-gray-900 dark:text-gray-100">
                    hello@feedstud.io
                  </p>
                </div>
                <div className="text-gray-300 transition-all group-hover:translate-x-1 group-hover:text-blue-500 dark:text-gray-700 dark:group-hover:text-blue-400">
                  <svg
                    className="h-5 w-5 rtl:rotate-180"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </div>
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
