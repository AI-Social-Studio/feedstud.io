import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CampaignStudio } from "@/components/studio/campaign-studio";
import { getSessionAppRole } from "@/lib/auth/roles";

export default async function NewCampaignPage() {
  const role = (await getSessionAppRole()) ?? "user";

  return (
    <DashboardShell role={role}>
      <CampaignStudio initialDraft={null} />
    </DashboardShell>
  );
}
