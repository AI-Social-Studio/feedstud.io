import { cookies } from "next/headers";
import { connection } from "next/server";
import { HomeView } from "@/components/dashboard/home-view";
import { listDraftsServer } from "@/lib/server-drafts-api";
import { getSessionAppRole } from "@/lib/auth/roles";
import type { DraftSummary } from "@/lib/drafts-api";
import { parseSidebarCollapsed, SIDEBAR_COLLAPSED_COOKIE_NAME } from "@/lib/sidebar-state";

export default async function DashboardHomePage() {
  const cookieStore = await cookies();
  const initialSidebarCollapsed = parseSidebarCollapsed(
    cookieStore.get(SIDEBAR_COLLAPSED_COOKIE_NAME)?.value,
  );
  const [drafts, role] = await Promise.all([listDraftsServer(100), getSessionAppRole()]);
  // connection() opts this page into per-request dynamic rendering, making Date.now() safe here:
  // https://nextjs.org/docs/app/getting-started/caching#working-with-non-deterministic-operations
  await connection();
  // eslint-disable-next-line react-hooks/purity -- see comment above
  const now = Date.now();
  const DAY_MS = 24 * 60 * 60 * 1000;
  const last7Days = countSince(drafts, now - 7 * DAY_MS);
  const last30Days = countSince(drafts, now - 30 * DAY_MS);
  const recentDrafts = drafts.slice(0, 3);

  return (
    <HomeView
      role={role ?? "user"}
      initialSidebarCollapsed={initialSidebarCollapsed}
      last7Days={last7Days}
      last30Days={last30Days}
      total={drafts.length}
      recentDrafts={recentDrafts}
    />
  );
}

function countSince(drafts: DraftSummary[], sinceMs: number): number {
  return drafts.filter((draft) => new Date(draft.created_at).getTime() >= sinceMs).length;
}
