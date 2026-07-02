"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CaretDown } from "@phosphor-icons/react/dist/ssr";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { NewCampaignButton } from "@/components/dashboard/new-campaign-button";
import { PlatformIconBadge } from "@/components/ui/platform-icon-badge";
import type { AppRole } from "@/lib/auth/roles";
import { useLanguage } from "@/lib/i18n";
import type { DraftSummary } from "@/lib/flowforge-api";
import type { Platform } from "@/components/studio/content-engine";

export function MyCampaignsView({ drafts, role }: { drafts: DraftSummary[]; role: AppRole }) {
  const { locale, dict } = useLanguage();
  const [query, setQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const filteredDrafts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const nextDrafts = normalizedQuery
      ? drafts.filter((draft) => {
          const title = draft.title.toLowerCase();
          const preview = draft.raw_text_preview.toLowerCase();
          return title.includes(normalizedQuery) || preview.includes(normalizedQuery);
        })
      : drafts;

    return [...nextDrafts].sort((a, b) => {
      const aTime = new Date(a.updated_at).getTime();
      const bTime = new Date(b.updated_at).getTime();
      return sortOrder === "newest" ? bTime - aTime : aTime - bTime;
    });
  }, [drafts, query, sortOrder]);

  return (
    <DashboardShell role={role}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="mb-1 text-2xl font-bold text-gray-900 dark:text-gray-50">
            {dict.myCampaigns.title}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{dict.myCampaigns.subtitle}</p>
        </div>
        <NewCampaignButton label={dict.myCampaigns.newCampaign} />
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={dict.myCampaigns.searchPlaceholder}
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 transition-colors outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100"
        />
        <div className="relative">
          <select
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value as "newest" | "oldest")}
            className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 py-3 pr-12 text-sm text-gray-900 transition-colors outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100"
          >
            <option value="newest">{dict.myCampaigns.sortNewest}</option>
            <option value="oldest">{dict.myCampaigns.sortOldest}</option>
          </select>
          <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-gray-400 dark:text-gray-500">
            <CaretDown size={14} weight="bold" />
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {drafts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
            {dict.myCampaigns.emptyState}
          </div>
        ) : filteredDrafts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
            {dict.myCampaigns.noResults}
          </div>
        ) : (
          filteredDrafts.map((draft) => (
            <Link
              key={draft.id}
              href={`/dashboard/drafts/${draft.id}`}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50/30 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-blue-800 dark:hover:bg-blue-500/5"
            >
              <div className="mb-3 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                    {draft.title}
                  </h2>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {draft.raw_text_preview || dict.myCampaigns.noDescription}
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
                <span className="ml-auto text-xs font-medium text-gray-500 dark:text-gray-400">
                  {draft.posts_count}{" "}
                  {draft.posts_count === 1 ? dict.myCampaigns.version : dict.myCampaigns.versions}
                </span>
              </div>
            </Link>
          ))
        )}
      </div>
    </DashboardShell>
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
