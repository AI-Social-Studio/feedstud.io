import { MyCampaignsView } from "@/components/dashboard/my-campaigns-view";
import { listDraftsServer } from "@/lib/flowforge-api-server";

export default async function MyCampaignsPage() {
  const drafts = await listDraftsServer();

  return <MyCampaignsView drafts={drafts} />;
}
