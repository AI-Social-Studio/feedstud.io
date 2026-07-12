import { cookies } from "next/headers";
import { ScheduledPostsView } from "@/components/dashboard/scheduled-posts-view";
import { getSessionAppRole } from "@/lib/auth/roles";
import { listScheduledPublicationsServer } from "@/lib/server-publications-api";
import { parseSidebarCollapsed, SIDEBAR_COLLAPSED_COOKIE_NAME } from "@/lib/sidebar-state";

const SCHEDULED_POSTS_PAGE_SIZE = 100;

export default async function ScheduledPostsPage() {
  const cookieStore = await cookies();
  const initialSidebarCollapsed = parseSidebarCollapsed(
    cookieStore.get(SIDEBAR_COLLAPSED_COOKIE_NAME)?.value,
  );

  const [role, scheduledResult] = await Promise.all([
    getSessionAppRole(),
    loadScheduledPublications(),
  ]);

  return (
    <ScheduledPostsView
      publications={scheduledResult.publications}
      hasMoreInitial={scheduledResult.hasMore}
      pageSize={SCHEDULED_POSTS_PAGE_SIZE}
      role={role ?? "user"}
      initialSidebarCollapsed={initialSidebarCollapsed}
      hasError={scheduledResult.hasError}
    />
  );
}

async function loadScheduledPublications() {
  try {
    const publications = await listScheduledPublicationsServer(SCHEDULED_POSTS_PAGE_SIZE, 0);
    return {
      publications,
      hasMore: publications.length === SCHEDULED_POSTS_PAGE_SIZE,
      hasError: false,
    };
  } catch {
    return { publications: [], hasMore: false, hasError: true };
  }
}
