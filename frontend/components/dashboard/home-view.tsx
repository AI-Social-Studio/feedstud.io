"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { NewCampaignButton } from "@/components/dashboard/new-campaign-button";
import { PlatformIconBadge } from "@/components/ui/platform-icon-badge";
import { OnboardingModal } from "@/components/onboarding/onboarding-modal";
import type { AppRole } from "@/lib/auth/roles";
import { useLanguage } from "@/lib/i18n";
import type { DraftSummary } from "@/lib/drafts-api";
import type { Platform } from "@/components/studio/content-engine";
import { upsertUserMemory } from "@/lib/memory-api";

const ONBOARDING_DISMISSED_KEY = "feedstudio:onboarding_dismissed";

type Props = {
  role: AppRole;
  initialSidebarCollapsed: boolean;
  last7Days: number;
  last30Days: number;
  total: number;
  recentDrafts: DraftSummary[];
};

export function HomeView({
  role,
  initialSidebarCollapsed,
  last7Days,
  last30Days,
  total,
  recentDrafts,
}: Props) {
  const { locale, dict } = useLanguage();
  const [showOnboarding, setShowOnboarding] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(ONBOARDING_DISMISSED_KEY) !== "1";
  });

  const dismissOnboarding = useCallback(() => {
    setShowOnboarding(false);
    localStorage.setItem(ONBOARDING_DISMISSED_KEY, "1");
  }, []);

  return (
    <DashboardShell role={role} initialCollapsed={initialSidebarCollapsed}>
      {showOnboarding && (
        <OnboardingModal
          onComplete={(data) => {
            dismissOnboarding();
            upsertUserMemory(data).catch((err: unknown) => {
              console.error("Failed to save onboarding memory:", err);
            });
          }}
          onSkip={dismissOnboarding}
        />
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="mb-1 text-2xl font-bold text-gray-900 dark:text-gray-50">
            {dict.home.title}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{dict.home.subtitle}</p>
        </div>
        <NewCampaignButton label={dict.home.newCampaign} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label={dict.home.statLast7} value={last7Days} />
        <StatCard label={dict.home.statLast30} value={last30Days} />
        <StatCard label={dict.home.statTotal} value={total} />
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            {dict.home.recentCampaigns}
          </h2>
          <Link
            href="/dashboard/history"
            className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            {dict.home.viewAll}
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {recentDrafts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
              {dict.home.emptyState}
            </div>
          ) : (
            recentDrafts.map((draft) => (
              <Link
                key={draft.id}
                href={`/dashboard/drafts/${draft.id}`}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50/30 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-blue-800 dark:hover:bg-blue-500/5"
              >
                <div className="mb-3 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                      {draft.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {draft.raw_text_preview || dict.home.noDescription}
                    </p>
                  </div>
                  <div className="shrink-0 text-xs text-gray-400 dark:text-gray-500">
                    {formatDate(draft.updated_at, locale)}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {draft.selected_platforms.map((platform) => (
                    <div
                      key={`${draft.id}-${platform}`}
                      className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    >
                      <PlatformIconBadge platform={platform as Platform} size="sm" />
                      <span className="capitalize">{platform}</span>
                    </div>
                  ))}
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </DashboardShell>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
      <div className="text-xs font-medium tracking-wider text-gray-400 uppercase dark:text-gray-500">
        {label}
      </div>
      <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-50">{value}</div>
    </div>
  );
}

function formatDate(value: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
