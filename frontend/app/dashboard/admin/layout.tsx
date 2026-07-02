import { cookies } from "next/headers";
import type { ReactNode } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { requireAdminContext } from "@/lib/auth/get-auth-context";
import { parseSidebarCollapsed, SIDEBAR_COLLAPSED_COOKIE_NAME } from "@/lib/sidebar-state";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const initialSidebarCollapsed = parseSidebarCollapsed(
    cookieStore.get(SIDEBAR_COLLAPSED_COOKIE_NAME)?.value,
  );
  const auth = await requireAdminContext();

  return (
    <DashboardShell role={auth.role} initialCollapsed={initialSidebarCollapsed}>
      {children}
    </DashboardShell>
  );
}
