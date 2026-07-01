"use client";

import { UserButton } from "@clerk/nextjs";
import type { AppRole } from "@/lib/auth/roles";
import {
  ClockCounterClockwise,
  House,
  Megaphone,
} from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SidebarNavItem } from "./sidebar-nav-item";

export function Sidebar({ role }: { role: AppRole }) {
  const pathname = usePathname();
  const isAdmin = role === "admin";

  return (
    <aside className="z-10 flex h-full w-64 flex-shrink-0 flex-col border-r border-gray-200 bg-white">
      <div className="flex h-16 items-center border-b border-gray-200 px-6">
        <Link href="/">
          <Image src="/socialstudio.png" alt="socialstudio.ai" width={99} height={32} priority />
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-3 px-3 text-xs font-medium uppercase tracking-wider text-gray-400">
          Main menu
        </div>
        <nav className="mb-8 space-y-1">
          <SidebarNavItem
            href="/dashboard"
            icon={<House size={18} weight="fill" />}
            label="Overview"
            active={pathname === "/dashboard" || pathname.startsWith("/dashboard/drafts/")}
          />
          <SidebarNavItem
            href="/dashboard/history"
            icon={<ClockCounterClockwise size={18} />}
            label="History"
            active={pathname === "/dashboard/history"}
          />
          <SidebarNavItem
            href="/dashboard"
            icon={<Megaphone size={18} />}
            label="Brand Voice"
          />
        </nav>

        {isAdmin ? (
          <>
            <div className="mb-3 px-3 text-xs font-medium uppercase tracking-wider text-gray-400">
              Admin
            </div>
            <nav className="mb-8 space-y-1">
              <SidebarNavItem
                href="/dashboard/admin"
                icon={<span className="h-2.5 w-2.5 rounded-full bg-violet-500" />}
                label="Admin Workspace"
                active={pathname === "/dashboard/admin" || pathname.startsWith("/dashboard/admin/")}
              />
            </nav>
          </>
        ) : null}

        <div className="mb-3 px-3 text-xs font-medium uppercase tracking-wider text-gray-400">
          AI Engines
        </div>
        <nav className="space-y-1">
          <SidebarNavItem
            href="/dashboard"
            icon={<span className="h-2 w-2 rounded-full bg-blue-500" />}
            label="LinkedIn B2B"
          />
          <SidebarNavItem
            href="/dashboard"
            icon={<span className="h-2 w-2 rounded-full bg-pink-500" />}
            label="Instagram Vibe"
          />
          <SidebarNavItem
            href="/dashboard"
            icon={<span className="h-2 w-2 rounded-full bg-gray-300" />}
            label="X (Twitter) Short"
          />
        </nav>
      </div>

      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center justify-between rounded-xl border border-gray-200 p-3">
          <div>
            <div className="text-sm font-semibold text-gray-900">Your account</div>
            <div className="text-xs text-gray-500">Role: {role}</div>
          </div>
          <UserButton />
        </div>
      </div>
    </aside>
  );
}
