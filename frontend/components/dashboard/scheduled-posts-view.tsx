"use client";

import type { ReactNode } from "react";
import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  CalendarBlankIcon,
  ClockCountdownIcon,
  LinkedinLogoIcon,
  XIcon,
} from "@phosphor-icons/react/dist/ssr";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import type { AppRole } from "@/lib/auth/roles";
import { useLanguage } from "@/lib/i18n";
import {
  getPublication,
  type Publication,
  type ScheduledPublication,
} from "@/lib/publications-api";
import { useHasMounted } from "@/lib/use-has-mounted";
import { useMountEffect } from "@/lib/use-mount-effect";

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
  const [previewPublication, setPreviewPublication] = useState<Publication | null>(null);
  const [previewSummary, setPreviewSummary] = useState<ScheduledPublication | null>(null);
  const [previewLoadingId, setPreviewLoadingId] = useState<string | null>(null);

  async function openPreview(publication: ScheduledPublication) {
    setPreviewSummary(publication);
    setPreviewLoadingId(publication.id);
    try {
      setPreviewPublication(await getPublication(publication.id));
    } finally {
      setPreviewLoadingId(null);
    }
  }

  function closePreview() {
    setPreviewPublication(null);
    setPreviewSummary(null);
    setPreviewLoadingId(null);
  }

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
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => openPreview(publication)}
                      disabled={previewLoadingId === publication.id}
                      className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-wait disabled:opacity-60 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200 dark:hover:bg-gray-900"
                    >
                      {previewLoadingId === publication.id
                        ? dict.scheduledPosts.previewLoading
                        : dict.scheduledPosts.preview}
                    </button>
                  </div>
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
      {previewSummary ? (
        <ScheduledPostPreviewModal
          publication={previewPublication}
          fallbackPublication={previewSummary}
          onClose={closePreview}
        />
      ) : null}
    </DashboardShell>
  );
}

function ScheduledPostPreviewModal({
  publication,
  fallbackPublication,
  onClose,
}: {
  publication: Publication | null;
  fallbackPublication: ScheduledPublication | null;
  onClose: () => void;
}) {
  const { locale, dict } = useLanguage();
  const hasMounted = useHasMounted();
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const activePublication = publication ?? fallbackPublication;

  useMountEffect(() => {
    if (!activePublication) return;
    previousFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previousFocusRef.current?.focus();
    };
  });

  if (!hasMounted || !activePublication) return null;

  return createPortal(
    <>
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        onClick={onClose}
        className="fixed inset-0 z-40 bg-gray-950/60 transition-opacity"
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <section
          role="dialog"
          aria-modal="true"
          aria-labelledby="scheduled-post-preview-title"
          className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 dark:bg-[#0a0a0f] dark:ring-white/10"
        >
          <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-5 dark:border-gray-800/60">
            <div className="min-w-0">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 dark:border-blue-900 dark:bg-blue-500/10 dark:text-blue-300">
                  <LinkedinLogoIcon size={14} weight="fill" />
                  <span>LinkedIn</span>
                </span>
                <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                  {getStatusLabel(activePublication.status, dict)}
                </span>
              </div>
              <h2
                id="scheduled-post-preview-title"
                className="text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-50"
              >
                {dict.scheduledPosts.previewTitle}
              </h2>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {dict.scheduledPosts.previewSubtitle}
              </p>
            </div>
            <button
              type="button"
              ref={closeButtonRef}
              onClick={onClose}
              className="inline-flex rounded-md p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
              aria-label={dict.common.cancel}
            >
              <XIcon className="size-5" />
            </button>
          </div>

          <div className="overflow-y-auto px-6 py-5">
            <div className="grid gap-3 md:grid-cols-2">
              <MetadataRow
                icon={<CalendarBlankIcon size={16} />}
                label={dict.scheduledPosts.scheduledFor}
                value={formatDateTime(activePublication.scheduled_for, locale)}
              />
              <MetadataRow
                icon={<ClockCountdownIcon size={16} />}
                label={dict.scheduledPosts.status}
                value={getStatusLabel(activePublication.status, dict)}
              />
              <MetadataRow
                label={dict.scheduledPosts.account}
                value={getAccountName(activePublication, dict)}
              />
              <MetadataRow
                label={dict.scheduledPosts.assets}
                value={getAssetCountLabel(activePublication, dict)}
              />
              <MetadataRow
                label={dict.scheduledPosts.draft}
                value={getDraftTitle(activePublication, dict)}
              />
              <MetadataRow label={dict.scheduledPosts.publicationId} value={activePublication.id} />
            </div>

            <div className="mt-5 rounded-2xl border border-gray-200 bg-gray-50/70 p-4 dark:border-gray-800 dark:bg-gray-950/70">
              <div className="mb-2 text-xs font-medium tracking-wide text-gray-400 uppercase dark:text-gray-500">
                {dict.scheduledPosts.fullContent}
              </div>
              <div className="text-sm whitespace-pre-wrap text-gray-800 dark:text-gray-200">
                {activePublication.platform_text}
              </div>
            </div>
          </div>
        </section>
      </div>
    </>,
    document.body,
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

function getStatusLabel(
  status: ScheduledPublication["status"] | Publication["status"],
  dict: ReturnType<typeof useLanguage>["dict"],
) {
  if (status === "queued") return dict.scheduledPosts.queued;
  if (status === "scheduled") return dict.scheduledPosts.scheduled;
  return status;
}

function getAccountName(
  publication: Publication | ScheduledPublication,
  dict: ReturnType<typeof useLanguage>["dict"],
) {
  if ("provider_account_name" in publication) {
    return publication.provider_account_name || dict.scheduledPosts.noAccount;
  }
  return dict.scheduledPosts.noAccount;
}

function getDraftTitle(
  publication: Publication | ScheduledPublication,
  dict: ReturnType<typeof useLanguage>["dict"],
) {
  if ("draft_title" in publication) {
    return publication.draft_title || dict.scheduledPosts.noDraft;
  }
  return dict.scheduledPosts.noDraft;
}

function getAssetCountLabel(
  publication: Publication | ScheduledPublication,
  dict: ReturnType<typeof useLanguage>["dict"],
) {
  if ("asset_count" in publication) {
    return dict.scheduledPosts.assetCount(publication.asset_count);
  }
  return dict.scheduledPosts.assetCount(publication.assets.length);
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
