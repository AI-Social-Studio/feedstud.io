"use client";

import { useState } from "react";
import { BrainIcon } from "@phosphor-icons/react/dist/ssr";
import type { AppRole } from "@/lib/auth/roles";
import { useDictionary } from "@/lib/i18n";
import { upsertUserMemory } from "@/lib/memory-api";
import type { UserMemory } from "@/types/memory";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { OnboardingModal } from "@/components/onboarding/onboarding-modal";

export function ProfileView({
  initialMemory,
  role,
  initialSidebarCollapsed,
}: {
  initialMemory: UserMemory | null;
  role: AppRole;
  initialSidebarCollapsed: boolean;
}) {
  const dict = useDictionary();
  const [memory, setMemory] = useState<UserMemory | null>(initialMemory);
  const [showWizard, setShowWizard] = useState(false);
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");

  async function handleComplete(data: Partial<UserMemory>) {
    try {
      await upsertUserMemory(data);
      setMemory((current) => ({
        interests_tags: current?.interests_tags || [],
        primary_platforms: current?.primary_platforms || [],
        target_audience_intents: current?.target_audience_intents || [],
        post_goals: current?.post_goals || [],
        ...current,
        ...data,
      }));
      setStatus("saved");
      setShowWizard(false);
    } catch {
      setStatus("error");
    }
  }

  return (
    <DashboardShell role={role} initialCollapsed={initialSidebarCollapsed}>
      <section className="space-y-6">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              <BrainIcon size={20} weight="fill" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {dict.profile.title}
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {dict.profile.subtitle}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setShowWizard(true)}
              className="inline-flex items-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              {dict.profile.reRunWizard}
            </button>
            {status === "saved" ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300">
                {dict.profile.savedToast}
              </div>
            ) : null}
            {status === "error" ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
                {dict.profile.errorToast}
              </div>
            ) : null}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <SummaryCard
            title={dict.onboarding.blockA.titleIdentity}
            values={mapIdentity(memory?.self_description, dict)}
            empty={dict.profile.emptyState}
          />
          <SummaryCard
            title={dict.onboarding.blockA.titleTags}
            values={memory?.interests_tags}
            empty={dict.profile.emptyState}
          />
          <SummaryCard
            title={dict.onboarding.blockB.titlePlatforms}
            values={mapPlatforms(memory?.primary_platforms, dict)}
            empty={dict.profile.emptyState}
          />
          <SummaryCard
            title={dict.onboarding.blockB.titleAudience}
            values={mapAudience(memory?.target_audience_intents, dict)}
            empty={dict.profile.emptyState}
          />
          <SummaryCard
            title={dict.onboarding.blockC.titleGoals}
            values={mapGoals(memory?.post_goals, dict)}
            empty={dict.profile.emptyState}
          />
        </div>
      </section>

      {showWizard ? (
        <OnboardingModal
          initialData={memory || undefined}
          onComplete={handleComplete}
          onSkip={() => setShowWizard(false)}
        />
      ) : null}
    </DashboardShell>
  );
}

function SummaryCard({
  title,
  values,
  empty,
}: {
  title: string;
  values?: string[];
  empty: string;
}) {
  const items = values || [];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <h2 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
      {items.length ? (
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <span
              key={`${title}-${item}`}
              className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            >
              {item}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400">{empty}</p>
      )}
    </div>
  );
}

function mapIdentity(value: string | undefined, dict: ReturnType<typeof useDictionary>): string[] {
  if (!value) return [];
  const labels = dict.onboarding.blockA.profiles;
  return [labels[value as keyof typeof labels]?.label || value];
}

function mapPlatforms(
  values: string[] | undefined,
  dict: ReturnType<typeof useDictionary>,
): string[] {
  if (!values?.length) return [];
  const labels = dict.onboarding.blockB.platforms;
  return values.map((value) => labels[value as keyof typeof labels] || value);
}

function mapAudience(
  values: string[] | undefined,
  dict: ReturnType<typeof useDictionary>,
): string[] {
  if (!values?.length) return [];
  const labels = dict.onboarding.blockB.audiences;
  return values.map((value) => labels[value as keyof typeof labels] || value);
}

function mapGoals(values: string[] | undefined, dict: ReturnType<typeof useDictionary>): string[] {
  if (!values?.length) return [];
  const labels = dict.onboarding.blockC.goals;
  return values.map((value) => labels[value as keyof typeof labels]?.label || value);
}
