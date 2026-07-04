import { cookies } from "next/headers";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CampaignStudio } from "@/components/studio/campaign-studio";
import { getSessionAppRole } from "@/lib/auth/roles";
import { listSocialConnectionsServer } from "@/lib/server-social-connections-api";
import { parseSidebarCollapsed, SIDEBAR_COLLAPSED_COOKIE_NAME } from "@/lib/sidebar-state";

type Props = {
  searchParams: Promise<{
    title?: string;
  }>;
};

export default async function NewCampaignPage({ searchParams }: Props) {
  const cookieStore = await cookies();
  const initialSidebarCollapsed = parseSidebarCollapsed(
    cookieStore.get(SIDEBAR_COLLAPSED_COOKIE_NAME)?.value,
  );
  const { title } = await searchParams;
  const [role, socialConnections] = await Promise.all([
    getSessionAppRole(),
    listSocialConnectionsServer(),
  ]);

  return (
    <DashboardShell role={role ?? "user"} initialCollapsed={initialSidebarCollapsed}>
      <CampaignStudio
        initialDraft={null}
        initialTitle={title?.trim() || undefined}
        initialSocialConnections={socialConnections}
        initialPublications={[]}
      />
    </DashboardShell>
  );
}
