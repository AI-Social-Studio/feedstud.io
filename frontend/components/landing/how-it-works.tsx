"use client";

import { ClipboardText, Note, Target } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/ui/reveal";
import { useDictionary } from "@/lib/i18n";

const ICONS = [
  <Note key="note" size={36} weight="fill" />,
  <Target key="target" size={36} weight="fill" />,
  <ClipboardText key="clipboard" size={36} weight="fill" />,
];
const NUMBERS = ["01", "02", "03"];

export function HowItWorks() {
  const dict = useDictionary();

  return (
    <section id="how-it-works" className="bg-gray-50 px-4 py-24 dark:bg-gray-900">
      <div className="container mx-auto max-w-5xl">
        <Reveal className="mb-16 text-center">
          <p className="mb-3 font-mono text-xs font-semibold tracking-widest text-blue-600 uppercase dark:text-blue-400">
            {dict.howItWorks.eyebrow}
          </p>
          <h2 className="text-4xl font-semibold tracking-tight text-gray-900 dark:text-gray-50">
            {dict.howItWorks.title}
          </h2>
        </Reveal>

        <div className="relative grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="absolute top-14 right-[calc(16.5%+1rem)] left-[calc(16.5%+1rem)] hidden h-px bg-gray-200 md:block dark:bg-gray-800" />

          {dict.howItWorks.steps.map((step, index) => (
            <Reveal
              key={step.title}
              delayMs={index * 100}
              className="flex flex-col items-center text-center"
            >
              <div className="relative mb-6">
                <div className="flex size-24 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition-transform duration-300 hover:scale-105 sm:size-28 dark:bg-blue-500/10 dark:text-blue-400">
                  {ICONS[index]}
                </div>
                <span className="absolute -top-2 -right-2 flex size-7 items-center justify-center rounded-full bg-blue-100 font-mono text-xs font-bold text-blue-600 dark:bg-blue-500/20 dark:text-blue-300">
                  {NUMBERS[index]}
                </span>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                {step.description}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
