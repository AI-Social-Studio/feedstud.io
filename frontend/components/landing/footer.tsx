"use client";

import Image from "next/image";
import Link from "next/link";
import { useDictionary } from "@/lib/i18n";

const CURRENT_YEAR = new Date().getFullYear();

export function Footer() {
  const dict = useDictionary();

  return (
    <footer className="border-t border-gray-100 bg-gray-50 px-4 pt-16 pb-8 dark:border-gray-800 dark:bg-gray-900">
      <div className="container max-w-5xl">
        <div className="grid grid-cols-1 gap-10 pb-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Image
              src="/socialstudio.png"
              alt="socialstudio.ai"
              width={99}
              height={32}
              className="dark:brightness-0 dark:invert"
            />
            <p className="mt-4 max-w-xs text-sm text-gray-500 dark:text-gray-400">{dict.footer.tagline}</p>
          </div>

          {dict.footer.columns.map((column) => (
            <div key={column.title}>
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                {column.title}
              </div>
              <ul className="mt-4 space-y-3">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-200 pt-6 text-xs text-gray-400 dark:border-gray-800 dark:text-gray-500 sm:flex-row">
          <p className="font-mono">
            © {CURRENT_YEAR} {dict.footer.copyrightSuffix}
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-gray-700 dark:hover:text-gray-300">
              {dict.legal.privacy.title}
            </Link>
            <Link href="/terms" className="hover:text-gray-700 dark:hover:text-gray-300">
              {dict.legal.terms.title}
            </Link>
            <Link href="/contact" className="hover:text-gray-700 dark:hover:text-gray-300">
              {dict.legal.contact.title}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
