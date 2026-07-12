import { cookies } from "next/headers";
import { ScheduledPostsView } from "@/components/dashboard/scheduled-posts-view";
import { getSessionAppRole } from "@/lib/auth/roles";
import { listScheduledPublicationsServer } from "@/lib/server-publications-api";
import { parseSidebarCollapsed, SIDEBAR_COLLAPSED_COOKIE_NAME } from "@/lib/sidebar-state";

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
      role={role ?? "user"}
      initialSidebarCollapsed={initialSidebarCollapsed}
      hasError={scheduledResult.hasError}
    />
  );
}

async function loadScheduledPublications() {
  try {
    return {
      publications: await listScheduledPublicationsServer(100, 0),
      hasError: false,
    };
  } catch {
    return { publications: [], hasError: true };
  }
}
