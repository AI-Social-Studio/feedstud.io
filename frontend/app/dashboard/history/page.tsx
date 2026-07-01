import Link from "next/link";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PlatformIconBadge } from "@/components/ui/platform-icon-badge";
import { listDraftsServer } from "@/lib/flowforge-api-server";
import type { Platform } from "@/components/studio/content-engine";

export default async function HistoryPage() {
  const drafts = await listDraftsServer();

  return (
    <DashboardShell>
      <div>
        <h1 className="mb-1 text-2xl font-bold text-gray-900">History</h1>
        <p className="text-sm text-gray-500">
          Return to saved drafts and reopen them in the studio.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {drafts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-sm text-gray-500">
            You do not have any saved drafts yet.
          </div>
        ) : (
          drafts.map((draft) => (
            <Link
              key={draft.id}
              href={`/dashboard/drafts/${draft.id}`}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-colors hover:border-blue-300 hover:bg-blue-50/30"
            >
              <div className="mb-3 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-base font-semibold text-gray-900">{draft.title}</h2>
                  <p className="mt-1 text-sm text-gray-500">{draft.raw_text_preview || "No description"}</p>
                </div>
                <div className="shrink-0 text-xs text-gray-400">
                  {formatDate(draft.updated_at)}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {draft.selected_platforms.map((platform) => (
                  <div
                    key={`${draft.id}-${platform}`}
                    className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-700"
                  >
                    <PlatformIconBadge platform={platform as Platform} size="sm" />
                    <span className="capitalize">{platform}</span>
                  </div>
                ))}
                <span className="ml-auto text-xs font-medium text-gray-500">
                  {draft.posts_count} {draft.posts_count === 1 ? "version" : "versions"}
                </span>
              </div>
            </Link>
          ))
        )}
      </div>
    </DashboardShell>
  );
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
