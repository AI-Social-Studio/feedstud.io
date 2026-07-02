"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import type { AppRole } from "@/lib/auth/roles";
import { Sidebar } from "./sidebar";
import { TopHeader } from "./top-header";

const SIDEBAR_COLLAPSED_KEY = "dashboard-sidebar-collapsed";

export function DashboardShell({ children, role }: { children: ReactNode; role: AppRole }) {
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "true";
  });

  function toggleSidebar() {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
      return next;
    });
  }

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-app dark:bg-gray-950">
      <div className="hero-grid pointer-events-none absolute inset-0 opacity-50 dark:opacity-100" />
      <Sidebar role={role} collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      <div className="relative z-10 flex h-full flex-1 flex-col overflow-hidden">
        <TopHeader />
        <main className="flex-1 overflow-y-auto p-8">
          <div key={pathname} className="container max-w-6xl space-y-8 pb-12 animate-page-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
