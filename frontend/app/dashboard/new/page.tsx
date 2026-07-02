import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CampaignStudio } from "@/components/studio/campaign-studio";
import { getSessionAppRole } from "@/lib/auth/roles";

type Props = {
  searchParams: Promise<{
    title?: string;
  }>;
};

export default async function NewCampaignPage({ searchParams }: Props) {
  const role = (await getSessionAppRole()) ?? "user";
  const { title } = await searchParams;

  return (
    <DashboardShell role={role}>
      <CampaignStudio initialDraft={null} initialTitle={title?.trim() || undefined} />
    </DashboardShell>
  );
}
