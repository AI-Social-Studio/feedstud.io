import React, { useId, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowRightIcon, CheckIcon } from "@phosphor-icons/react/dist/ssr";
import { useDictionary } from "@/lib/i18n";
import { useHasMounted } from "@/lib/use-has-mounted";
import { useMountEffect } from "@/lib/use-mount-effect";
import { cn } from "@/lib/utils";
import type { UserMemory } from "@/types/memory";
import { BlockA } from "./block-a";
import { BlockB } from "./block-b";
import { BlockC } from "./block-c";

export function OnboardingModal({
  onComplete,
  onSkip,
  initialData,
}: {
  onComplete: (data: Partial<UserMemory>) => void;
  onSkip: () => void;
  initialData?: Partial<UserMemory>;
}) {
  const hasMounted = useHasMounted();
  const dict = useDictionary().onboarding;
  const [step, setStep] = useState(1);
  const [data, setData] = useState<Partial<UserMemory>>(() => ({
    interests_tags: [],
    primary_platforms: [],
    target_audience_intents: [],
    post_goals: [],
    ...initialData,
  }));
  const titleId = useId();

  useMountEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onSkip();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  });

  const steps = [
    { id: 1, title: dict.steps.identity },
    { id: 2, title: dict.steps.audience },
    { id: 3, title: dict.steps.goals },
  ];

  function canProceed() {
    if (step === 1) {
      return (
        !!data.self_description &&
        data.self_description.trim() !== "" &&
        data.self_description !== "other"
      );
    }
    if (step === 2) {
      return !(data.target_audience_intents || []).includes("other");
    }
    if (step === 3) {
      return (data.post_goals || []).length > 0;
    }
    return true;
  }

  function handleNext() {
    if (step < 3) {
      setStep((current) => current + 1);
      return;
    }
    onComplete(data);
  }

  if (!hasMounted) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="animate-page-in fixed inset-0 z-999 flex items-center justify-center bg-gray-950/60 p-4 backdrop-blur-sm"
    >
      <div className="animate-in fade-in zoom-in-95 w-full max-w-3xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl duration-300 dark:border-gray-800 dark:bg-gray-950">
        <div className="flex flex-col gap-5 border-b border-gray-100 bg-gray-50/30 px-8 pt-8 pb-5 dark:border-gray-900 dark:bg-gray-900/10">
          <div className="flex items-center justify-between">
            <h1 id={titleId} className="text-xl font-semibold text-gray-900 dark:text-white">
              {dict.header.title}
            </h1>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {dict.header.stepXofY(step, 3)}
            </div>
          </div>

          <div className="flex items-center">
            {steps.map((item, index) => (
              <React.Fragment key={item.id}>
                <div className="flex items-center gap-2.5">
                  <div
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors duration-300",
                      step > item.id
                        ? "bg-blue-600 text-white dark:bg-blue-500"
                        : step === item.id
                          ? "border-2 border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500"
                          : "border-2 border-gray-200 text-gray-400 dark:border-gray-800 dark:text-gray-500",
                    )}
                  >
                    {step > item.id ? <CheckIcon weight="bold" size={14} /> : item.id}
                  </div>
                  <span
                    className={cn(
                      "text-sm font-medium transition-colors duration-300",
                      step >= item.id
                        ? "text-gray-900 dark:text-gray-100"
                        : "text-gray-400 dark:text-gray-600",
                    )}
                  >
                    {item.title}
                  </span>
                </div>
                {index < steps.length - 1 ? (
                  <div className="mx-4 h-px flex-1 bg-gray-200 dark:bg-gray-800">
                    <div
                      className="h-full bg-blue-600 transition-all duration-500 dark:bg-blue-500"
                      style={{ width: step > item.id ? "100%" : "0%" }}
                    />
                  </div>
                ) : null}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="relative min-h-110 bg-white px-8 py-6 dark:bg-gray-950">
          {step === 1 ? (
            <BlockA data={data} onChange={(updates) => setData({ ...data, ...updates })} />
          ) : null}
          {step === 2 ? (
            <BlockB data={data} onChange={(updates) => setData({ ...data, ...updates })} />
          ) : null}
          {step === 3 ? (
            <BlockC data={data} onChange={(updates) => setData({ ...data, ...updates })} />
          ) : null}
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/50 px-8 py-5 dark:border-gray-900 dark:bg-gray-900/30">
          <button
            type="button"
            onClick={onSkip}
            className="text-sm font-medium text-gray-500 transition-colors hover:text-gray-900 hover:underline dark:text-gray-400 dark:hover:text-gray-100"
          >
            {dict.navigation.skip}
          </button>

          <div className="flex gap-3">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((current) => current - 1)}
                className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300 dark:hover:bg-gray-900"
              >
                {dict.navigation.back}
              </button>
            ) : null}
            <button
              type="button"
              onClick={handleNext}
              disabled={!canProceed()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:pointer-events-none disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              {step === 3 ? dict.navigation.finish : dict.navigation.next}
              {step < 3 ? <ArrowRightIcon weight="bold" size={16} /> : null}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
