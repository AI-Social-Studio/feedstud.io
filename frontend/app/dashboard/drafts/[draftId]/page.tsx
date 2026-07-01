import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CampaignStudio } from "@/components/studio/campaign-studio";
import { fetchDraftServer } from "@/lib/flowforge-api-server";
import { getSessionAppRole } from "@/lib/auth/roles";

type Props = {
  params: Promise<{
    draftId: string;
  }>;
};

export default async function DraftPage({ params }: Props) {
  const { draftId } = await params;
  const [draft, role] = await Promise.all([fetchDraftServer(draftId), getSessionAppRole()]);

  if (!draft) notFound();

  return (
    <DashboardShell role={role ?? "user"}>
      <CampaignStudio initialDraft={draft} />
    </DashboardShell>
  );
}
