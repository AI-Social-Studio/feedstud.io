import { MyCampaignsView } from "@/components/dashboard/my-campaigns-view";
import { listDraftsServer } from "@/lib/flowforge-api-server";
import { getSessionAppRole } from "@/lib/auth/roles";

export default async function MyCampaignsPage() {
  const [drafts, role] = await Promise.all([listDraftsServer(100), getSessionAppRole()]);

  return <MyCampaignsView drafts={drafts} role={role ?? "user"} />;
}
