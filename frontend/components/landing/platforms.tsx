"use client";

import {
  InstagramLogo,
  LinkedinLogo,
  XLogo,
} from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/ui/reveal";
import { useDictionary } from "@/lib/i18n";

const NAMES = ["LinkedIn", "Instagram", "X (Twitter)"];

const BADGES = [
  <div key="linkedin" className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
    <LinkedinLogo size={22} weight="fill" className="text-white" />
  </div>,
  <div
    key="instagram"
    className="w-10 h-10 rounded-lg bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 flex items-center justify-center"
  >
    <InstagramLogo size={22} weight="fill" className="text-white" />
  </div>,
  <div key="x" className="w-10 h-10 rounded-lg bg-gray-900 flex items-center justify-center">
    <XLogo size={22} weight="fill" className="text-white" />
  </div>,
];

export function Platforms() {
  const dict = useDictionary();

  return (
    <section id="platforms" className="bg-gray-50 py-24 px-4 dark:bg-gray-900">
      <div className="max-w-5xl mx-auto">
        <Reveal className="text-center mb-16">
          <p className="font-mono text-xs font-semibold uppercase tracking-widest text-blue-600 mb-3 dark:text-blue-400">
            {dict.platforms.eyebrow}
          </p>
          <h2 className="text-4xl font-semibold tracking-tight text-gray-900 dark:text-gray-50">
            {dict.platforms.title}
          </h2>
          <p className="mt-4 text-gray-500 max-w-xl mx-auto dark:text-gray-400">
            {dict.platforms.subtitle}
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {dict.platforms.items.map((p, index) => (
            <Reveal key={NAMES[index]} delayMs={index * 100}>
              <div className="h-full rounded-2xl border border-gray-100 bg-white p-6 flex flex-col gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:border-gray-800 dark:bg-gray-950">
                <div className="flex items-center gap-3">
                  {BADGES[index]}
                  <div>
                    <div className="font-semibold text-gray-900 text-sm dark:text-gray-100">{NAMES[index]}</div>
                    <div className="text-xs text-gray-400 dark:text-gray-500">{p.tagline}</div>
                  </div>
                </div>

                <ul className="space-y-1.5">
                  {p.traits.map((trait) => (
                    <li key={trait} className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <span className="w-1 h-1 rounded-full bg-blue-400 flex-shrink-0" />
                      {trait}
                    </li>
                  ))}
                </ul>

                <div className="mt-auto rounded-xl bg-gray-50 border border-gray-100 p-3 dark:bg-gray-900 dark:border-gray-800">
                  <p className="font-mono text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider dark:text-gray-500">
                    {dict.platforms.exampleLabel}
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed italic dark:text-gray-300">
                    &ldquo;{p.example}&rdquo;
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
