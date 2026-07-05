import React, { useState } from "react";
import { createPortal } from "react-dom";
import { ArrowRight as ArrowRightIcon, Check as CheckIcon } from "@phosphor-icons/react/dist/ssr";
import { BlockA } from "./block-a";
import { BlockB } from "./block-b";
import { BlockC } from "./block-c";
import type { UserMemory } from "@/types/memory";
import { cn } from "@/lib/utils";
import { useDictionary } from "@/lib/i18n";

export function OnboardingModal({
  onComplete,
  onSkip,
}: {
  onComplete: (data: Partial<UserMemory>) => void;
  onSkip: () => void;
}) {
  const dict = useDictionary().onboarding;
  const [step, setStep] = useState(1);
  const [data, setData] = useState<Partial<UserMemory>>({
    interests_tags: [],
    primary_platforms: [],
    target_audience_intents: [],
    post_goals: [],
  });

  const STEPS = [
    { id: 1, title: dict.steps.identity },
    { id: 2, title: dict.steps.audience },
    { id: 3, title: dict.steps.goals },
  ];

  const canProceed = () => {
    if (step === 1) {
      return !!data.self_description && data.self_description.trim() !== "" && data.self_description !== "other";
    }
    if (step === 2) {
      return !(data.target_audience_intents || []).includes("other");
    }
    if (step === 3) return data.post_goals && data.post_goals.length > 0;
    return true;
  };

  const handleNext = () => {
    if (step < 3) {
      setStep((s) => s + 1);
    } else {
      onComplete(data);
    }
  };

  return createPortal(
    <div className="animate-page-in fixed inset-0 z-999 bg-gray-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="animate-in fade-in zoom-in-95 duration-300 w-full max-w-3xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-950">
        
        {/* Header */}
        <div className="flex flex-col gap-5 px-8 pt-8 pb-5 border-b border-gray-100 dark:border-gray-900 bg-gray-50/30 dark:bg-gray-900/10">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              {dict.header.title}
            </h1>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {dict.header.stepXofY(step, 3)}
            </div>
          </div>
          
          {/* Stepper */}
          <div className="flex items-center">
            {STEPS.map((s, idx) => (
              <React.Fragment key={s.id}>
                <div className="flex items-center gap-2.5">
                  <div
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors duration-300",
                      step > s.id
                        ? "bg-blue-600 text-white dark:bg-blue-500"
                        : step === s.id
                        ? "border-2 border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500"
                        : "border-2 border-gray-200 text-gray-400 dark:border-gray-800 dark:text-gray-500"
                    )}
                  >
                    {step > s.id ? <CheckIcon weight="bold" size={14} /> : s.id}
                  </div>
                  <span
                    className={cn(
                      "text-sm font-medium transition-colors duration-300",
                      step >= s.id ? "text-gray-900 dark:text-gray-100" : "text-gray-400 dark:text-gray-600"
                    )}
                  >
                    {s.title}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className="mx-4 flex-1 h-px bg-gray-200 dark:bg-gray-800">
                    <div
                      className="h-full bg-blue-600 transition-all duration-500 dark:bg-blue-500"
                      style={{ width: step > s.id ? "100%" : "0%" }}
                    />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="relative px-8 py-6 min-h-110 bg-white dark:bg-gray-950">
          {step === 1 && (
            <BlockA data={data} onChange={(updates) => setData({ ...data, ...updates })} />
          )}
          {step === 2 && (
            <BlockB data={data} onChange={(updates) => setData({ ...data, ...updates })} />
          )}
          {step === 3 && (
            <BlockC data={data} onChange={(updates) => setData({ ...data, ...updates })} />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/50 px-8 py-5 dark:border-gray-900 dark:bg-gray-900/30">
          <button
            type="button"
            onClick={onSkip}
            className="text-sm font-medium text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:underline"
          >
            {dict.navigation.skip}
          </button>
          
          <div className="flex gap-3">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="rounded-xl px-5 py-2.5 text-sm font-semibold text-gray-700 border border-gray-200 bg-white transition-colors hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300 dark:hover:bg-gray-900"
              >
                {dict.navigation.back}
              </button>
            )}
            <button
              type="button"
              onClick={handleNext}
              disabled={!canProceed()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:pointer-events-none disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              {step === 3 ? dict.navigation.finish : dict.navigation.next}
              {step < 3 && <ArrowRightIcon weight="bold" size={16} />}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
