import type { ReactNode } from "react";
import { getSessionAppRole, type AppRole } from "@/lib/auth/roles";
import { Sidebar } from "./sidebar";
import { TopHeader } from "./top-header";

export async function DashboardShell({
  children,
  role,
}: {
  children: ReactNode;
  role?: AppRole;
}) {
  const resolvedRole = role ?? (await getSessionAppRole()) ?? "user";

  return (
    <div className="h-screen flex overflow-hidden w-full">
      <Sidebar role={resolvedRole} />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <TopHeader />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto space-y-8 pb-12">{children}</div>
        </main>
      </div>
    </div>
  );
}
