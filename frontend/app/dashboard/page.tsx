import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CampaignStudio } from "@/components/studio/campaign-studio";

export default function DashboardPage() {
  return (
    <DashboardShell>
      <CampaignStudio initialDraft={null} />
    </DashboardShell>
  );
}
