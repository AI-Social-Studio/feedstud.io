"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { TopHeader } from "./top-header";

export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="h-screen flex overflow-hidden w-full bg-app dark:bg-gray-950">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <TopHeader />
        <main className="flex-1 overflow-y-auto p-8">
          <div key={pathname} className="max-w-6xl mx-auto space-y-8 pb-12 animate-page-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
