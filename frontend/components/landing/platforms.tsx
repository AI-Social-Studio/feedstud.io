"use client";

import { InstagramLogo, LinkedinLogo, XLogo } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/ui/reveal";
import { useDictionary } from "@/lib/i18n";

const NAMES = ["LinkedIn", "Instagram", "X (Twitter)"];

const BADGES = [
  <div key="linkedin" className="flex size-10 items-center justify-center rounded-lg bg-blue-600">
    <LinkedinLogo size={22} weight="fill" className="text-white" />
  </div>,
  <div
    key="instagram"
    className="flex size-10 items-center justify-center rounded-lg bg-linear-to-tr from-yellow-400 via-pink-500 to-purple-500"
  >
    <InstagramLogo size={22} weight="fill" className="text-white" />
  </div>,
  <div key="x" className="flex size-10 items-center justify-center rounded-lg bg-gray-900">
    <XLogo size={22} weight="fill" className="text-white" />
  </div>,
];

export function Platforms() {
  const dict = useDictionary();

  return (
    <section id="platforms" className="bg-gray-50 px-4 py-24 dark:bg-gray-900">
      <div className="container max-w-5xl">
        <Reveal className="mb-16 text-center">
          <p className="mb-3 font-mono text-xs font-semibold tracking-widest text-blue-600 uppercase dark:text-blue-400">
            {dict.platforms.eyebrow}
          </p>
          <h2 className="text-4xl font-semibold tracking-tight text-gray-900 dark:text-gray-50">
            {dict.platforms.title}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-gray-500 dark:text-gray-400">
            {dict.platforms.subtitle}
          </p>
        </Reveal>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {dict.platforms.items.map((p, index) => (
            <Reveal key={NAMES[index]} delayMs={index * 100}>
              <div className="flex h-full flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:border-gray-800 dark:bg-gray-950">
                <div className="flex items-center gap-3">
                  {BADGES[index]}
                  <div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {NAMES[index]}
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500">{p.tagline}</div>
                  </div>
                </div>

                <ul className="space-y-1.5">
                  {p.traits.map((trait) => (
                    <li
                      key={trait}
                      className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400"
                    >
                      <span className="size-1 flex-shrink-0 rounded-full bg-blue-400" />
                      {trait}
                    </li>
                  ))}
                </ul>

                <div className="mt-auto rounded-xl border border-gray-100 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-900">
                  <p className="mb-1.5 font-mono text-xs font-medium tracking-wider text-gray-400 uppercase dark:text-gray-500">
                    {dict.platforms.exampleLabel}
                  </p>
                  <p className="text-sm leading-relaxed text-gray-700 italic dark:text-gray-300">
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
