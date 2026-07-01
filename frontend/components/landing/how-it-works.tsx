"use client";

import { ClipboardText, Note, Target } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/ui/reveal";
import { useDictionary } from "@/lib/i18n";

const ICONS = [
  <Note key="note" size={28} weight="fill" />,
  <Target key="target" size={28} weight="fill" />,
  <ClipboardText key="clipboard" size={28} weight="fill" />,
];
const NUMBERS = ["01", "02", "03"];

export function HowItWorks() {
  const dict = useDictionary();

  return (
    <section id="how-it-works" className="bg-gray-50 py-24 px-4 dark:bg-gray-900">
      <div className="max-w-5xl mx-auto">
        <Reveal className="text-center mb-16">
          <p className="font-mono text-xs font-semibold uppercase tracking-widest text-blue-600 mb-3 dark:text-blue-400">
            {dict.howItWorks.eyebrow}
          </p>
          <h2 className="text-4xl font-semibold tracking-tight text-gray-900 dark:text-gray-50">
            {dict.howItWorks.title}
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-10 left-[calc(16.5%+1rem)] right-[calc(16.5%+1rem)] h-px bg-gray-200 dark:bg-gray-800" />

          {dict.howItWorks.steps.map((step, index) => (
            <Reveal key={step.title} delayMs={index * 100} className="flex flex-col items-center text-center">
              <div className="relative mb-6">
                <div className="w-20 h-20 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 transition-transform duration-300 hover:scale-105 dark:bg-blue-500/10 dark:text-blue-400">
                  {ICONS[index]}
                </div>
                <span className="absolute -top-2 -right-2 font-mono text-xs font-bold text-blue-600 bg-blue-100 rounded-full w-6 h-6 flex items-center justify-center dark:text-blue-300 dark:bg-blue-500/20">
                  {NUMBERS[index]}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 dark:text-gray-100">
                {step.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed dark:text-gray-400">
                {step.description}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
