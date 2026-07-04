import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CampaignStudio } from "@/components/studio/campaign-studio";
import { fetchDraftServer } from "@/lib/server-drafts-api";
import { getSessionAppRole } from "@/lib/auth/roles";
import { listPublicationsServer } from "@/lib/server-publications-api";
import { listSocialConnectionsServer } from "@/lib/server-social-connections-api";
import { parseSidebarCollapsed, SIDEBAR_COLLAPSED_COOKIE_NAME } from "@/lib/sidebar-state";

type Props = {
  params: Promise<{
    draftId: string;
  }>;
};

export default async function DraftPage({ params }: Props) {
  const cookieStore = await cookies();
  const initialSidebarCollapsed = parseSidebarCollapsed(
    cookieStore.get(SIDEBAR_COLLAPSED_COOKIE_NAME)?.value,
  );
  const { draftId } = await params;
  const [draft, role, socialConnections, publications] = await Promise.all([
    fetchDraftServer(draftId),
    getSessionAppRole(),
    listSocialConnectionsServer(),
    listPublicationsServer(draftId),
  ]);

  if (!draft) notFound();

  return (
    <DashboardShell role={role ?? "user"} initialCollapsed={initialSidebarCollapsed}>
      <CampaignStudio
        initialDraft={draft}
        initialSocialConnections={socialConnections}
        initialPublications={publications}
      />
    </DashboardShell>
  );
}
