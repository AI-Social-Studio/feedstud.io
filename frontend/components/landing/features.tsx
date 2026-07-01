"use client";

import {
  Brain,
  CheckCircle,
  Clock,
  Lightning,
} from "@phosphor-icons/react/dist/ssr";
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
    <section id="features" className="bg-white py-24 px-4 dark:bg-gray-950">
      <div className="max-w-5xl mx-auto">
        <Reveal className="text-center mb-16">
          <p className="font-mono text-xs font-semibold uppercase tracking-widest text-blue-600 mb-3 dark:text-blue-400">
            {dict.features.eyebrow}
          </p>
          <h2 className="text-4xl font-semibold tracking-tight text-gray-900 dark:text-gray-50">
            {dict.features.title}
          </h2>
          <p className="mt-4 text-gray-500 max-w-xl mx-auto dark:text-gray-400">
            {dict.features.subtitle}
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {dict.features.items.map((feature, index) => (
            <Reveal key={feature.title} delayMs={index * 80}>
              <div className="h-full bg-gray-50 rounded-2xl p-6 border border-gray-100 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:bg-gray-900 dark:border-gray-800">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-4 dark:bg-blue-500/10">
                  {ICONS[index]}
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2 dark:text-gray-100">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed dark:text-gray-400">
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
