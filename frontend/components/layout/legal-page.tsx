"use client";

import Link from "next/link";
import { Footer } from "@/components/landing/footer";
import { useDictionary } from "@/lib/i18n";
import { MarketingHeader } from "./marketing-header";

export function LegalPage({ page }: { page: "privacy" | "terms" }) {
  const dict = useDictionary();
  const content = dict.legal[page];

  return (
    <div className="flex min-h-screen flex-col">
      <MarketingHeader />
      <main className="flex-1 bg-white px-4 py-16 dark:bg-gray-950">
        <div className="mx-auto max-w-3xl animate-page-in">
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-50">
            {content.title}
          </h1>
          <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
            {dict.legal.lastUpdated}: {content.updatedDate}
          </p>
          <div className="mt-10 space-y-6 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
            <p>{content.intro}</p>
            {content.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {section.heading}
                </h2>
                {Array.isArray(section.body) ? (
                  <ul className="list-disc space-y-1 pl-5">
                    {section.body.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p>{section.body}</p>
                )}
              </section>
            ))}
            <section>
              <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                {dict.legal.contactHeading}
              </h2>
              <p>
                {dict.legal.contactBody}{" "}
                <Link href="/contact" className="text-blue-600 hover:underline dark:text-blue-400">
                  {dict.legal.contactLinkText}
                </Link>
                .
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
