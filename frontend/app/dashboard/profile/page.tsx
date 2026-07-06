import { cookies } from "next/headers";
import { ProfileView } from "@/components/dashboard/profile-view";
import { getSessionAppRole } from "@/lib/auth/roles";
import { getUserMemoryServer } from "@/lib/server-memory-api";
import { parseSidebarCollapsed, SIDEBAR_COLLAPSED_COOKIE_NAME } from "@/lib/sidebar-state";

export default async function DashboardProfilePage() {
  const cookieStore = await cookies();
  const initialSidebarCollapsed = parseSidebarCollapsed(
    cookieStore.get(SIDEBAR_COLLAPSED_COOKIE_NAME)?.value,
  );
  const [memory, role] = await Promise.all([getUserMemoryServer(), getSessionAppRole()]);

  return (
    <ProfileView
      initialMemory={memory}
      role={role ?? "user"}
      initialSidebarCollapsed={initialSidebarCollapsed}
    />
  );
}
