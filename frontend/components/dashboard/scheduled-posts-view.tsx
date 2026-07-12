"use client";

import type { ReactNode } from "react";
import {
  CalendarBlankIcon,
  ClockCountdownIcon,
  LinkedinLogoIcon,
} from "@phosphor-icons/react/dist/ssr";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import type { AppRole } from "@/lib/auth/roles";
import { useLanguage } from "@/lib/i18n";
import type { ScheduledPublication } from "@/lib/publications-api";

type Props = {
  publications: ScheduledPublication[];
  role: AppRole;
  initialSidebarCollapsed: boolean;
  hasError: boolean;
};

export function ScheduledPostsView({
  publications,
  role,
  initialSidebarCollapsed,
  hasError,
}: Props) {
  const { locale, dict } = useLanguage();

  return (
    <DashboardShell role={role} initialCollapsed={initialSidebarCollapsed}>
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
          {dict.scheduledPosts.title}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">{dict.scheduledPosts.subtitle}</p>
      </div>

      {hasError ? (
        <StateCard>{dict.scheduledPosts.errorState}</StateCard>
      ) : publications.length === 0 ? (
        <StateCard>{dict.scheduledPosts.emptyState}</StateCard>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {publications.map((publication) => (
            <article
              key={publication.id}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 dark:border-blue-900 dark:bg-blue-500/10 dark:text-blue-300">
                      <LinkedinLogoIcon size={14} weight="fill" />
                      <span>{dict.scheduledPosts.platform}</span>
                      <span>LinkedIn</span>
                    </span>
                    <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                      {getStatusLabel(publication.status, dict)}
                    </span>
                  </div>

                  <h2 className="mt-3 text-base font-semibold text-gray-900 dark:text-gray-100">
                    {publication.draft_title || dict.scheduledPosts.noDraft}
                  </h2>
                  <p className="mt-2 line-clamp-3 text-sm whitespace-pre-wrap text-gray-600 dark:text-gray-300">
                    {publication.platform_text}
                  </p>
                </div>

                <div className="grid min-w-0 gap-3 text-sm text-gray-600 sm:grid-cols-2 lg:w-88 lg:grid-cols-1 dark:text-gray-300">
                  <MetadataRow
                    icon={<CalendarBlankIcon size={16} />}
                    label={dict.scheduledPosts.scheduledFor}
                    value={formatDateTime(publication.scheduled_for, locale)}
                  />
                  <MetadataRow
                    icon={<ClockCountdownIcon size={16} />}
                    label={dict.scheduledPosts.status}
                    value={getStatusLabel(publication.status, dict)}
                  />
                  <MetadataRow
                    label={dict.scheduledPosts.account}
                    value={publication.provider_account_name || dict.scheduledPosts.noAccount}
                  />
                  <MetadataRow
                    label={dict.scheduledPosts.assets}
                    value={dict.scheduledPosts.assetCount(publication.asset_count)}
                  />
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}

function StateCard({ children }: { children: string }) {
  return (
    <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
      {children}
    </div>
  );
}

function MetadataRow({ label, value, icon }: { label: string; value: string; icon?: ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50/80 px-3 py-2.5 dark:border-gray-800 dark:bg-gray-950/60">
      <div className="flex items-center gap-2 text-xs font-medium tracking-wide text-gray-400 uppercase dark:text-gray-500">
        {icon}
        <span>{label}</span>
      </div>
      <div className="mt-1 text-sm font-medium text-gray-800 dark:text-gray-200">{value}</div>
    </div>
  );
}

function getStatusLabel(status: ScheduledPublication["status"], dict: ReturnType<typeof useLanguage>["dict"]) {
  if (status === "queued") return dict.scheduledPosts.queued;
  return dict.scheduledPosts.scheduled;
}

function formatDateTime(value: string | null, locale: string) {
  if (!value) return "-";
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}
