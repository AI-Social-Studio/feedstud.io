"use client";

import { Brain, CheckCircle, Clock, Lightning } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/ui/reveal";
import { useDictionary } from "@/lib/i18n";

const ICONS = [
  <Brain key="brain" size={24} weight="fill" className="text-blue-600" />,
  <Lightning key="lightning" size={24} weight="fill" className="text-blue-600" />,
  <Clock key="clock" size={24} weight="fill" className="text-blue-600" />,
  <CheckCircle key="check" size={24} weight="fill" className="text-blue-600" />,
];

export function Features() {
  const dict = useDictionary();

  return (
    <section id="features" className="bg-white px-4 py-24 dark:bg-gray-950">
      <div className="container mx-auto max-w-5xl">
        <Reveal className="mb-16 text-center">
          <p className="mb-3 font-mono text-xs font-semibold tracking-widest text-blue-600 uppercase dark:text-blue-400">
            {dict.features.eyebrow}
          </p>
          <h2 className="text-4xl font-semibold tracking-tight text-gray-900 dark:text-gray-50">
            {dict.features.title}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-gray-500 dark:text-gray-400">
            {dict.features.subtitle}
          </p>
        </Reveal>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {dict.features.items.map((feature, index) => (
            <Reveal key={feature.title} delayMs={index * 80}>
              <div className="h-full rounded-2xl border border-gray-100 bg-gray-50 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
                <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10">
                  {ICONS[index]}
                </div>
                <h3 className="mb-2 text-base font-semibold text-gray-900 dark:text-gray-100">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
