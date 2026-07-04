import { cookies } from "next/headers";
import { MyCampaignsView } from "@/components/dashboard/my-campaigns-view";
import { listDraftsServer } from "@/lib/feedstudio-api-server";
import { getSessionAppRole } from "@/lib/auth/roles";
import { parseSidebarCollapsed, SIDEBAR_COLLAPSED_COOKIE_NAME } from "@/lib/sidebar-state";

export default async function MyCampaignsPage() {
  const cookieStore = await cookies();
  const initialSidebarCollapsed = parseSidebarCollapsed(
    cookieStore.get(SIDEBAR_COLLAPSED_COOKIE_NAME)?.value,
  );
  const [drafts, role] = await Promise.all([listDraftsServer(100), getSessionAppRole()]);

  return (
    <MyCampaignsView
      drafts={drafts}
      role={role ?? "user"}
      initialSidebarCollapsed={initialSidebarCollapsed}
    />
  );
}
