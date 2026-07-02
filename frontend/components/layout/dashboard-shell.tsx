"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import type { AppRole } from "@/lib/auth/roles";
import { SIDEBAR_COLLAPSED_COOKIE_NAME } from "@/lib/sidebar-state";
import { Sidebar } from "./sidebar";
import { TopHeader } from "./top-header";

const SIDEBAR_COLLAPSED_KEY = SIDEBAR_COLLAPSED_COOKIE_NAME;

export function DashboardShell({
  children,
  role,
  initialCollapsed = false,
}: {
  children: ReactNode;
  role: AppRole;
  initialCollapsed?: boolean;
}) {
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(initialCollapsed);

  function toggleSidebar() {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
      document.cookie = `${SIDEBAR_COLLAPSED_COOKIE_NAME}=${String(next)}; path=/; max-age=31536000; samesite=lax`;
      return next;
    });
  }

  return (
    <div className="bg-app relative flex h-screen w-full overflow-hidden dark:bg-gray-950">
      <div className="hero-grid pointer-events-none absolute inset-0 opacity-50 dark:opacity-100" />
      <Sidebar role={role} collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      <div className="relative z-10 flex h-full flex-1 flex-col overflow-hidden">
        <TopHeader />
        <main className="flex-1 overflow-y-auto p-8">
          <div key={pathname} className="animate-page-in container mx-auto max-w-6xl space-y-8 pb-12">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
