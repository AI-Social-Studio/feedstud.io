"use client";

import { UserButton } from "@clerk/nextjs";
import {
  BrainIcon,
  CalendarBlankIcon,
  CaretDoubleLeftIcon,
  HouseIcon,
  ListIcon,
  MegaphoneIcon,
  ShieldIcon,
  XIcon,
} from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import type { AppRole } from "@/lib/auth/roles";
import { useDictionary } from "@/lib/i18n";
import { SidebarNavItem } from "./sidebar-nav-item";

export function Sidebar({
  role,
  collapsed,
  onToggle,
  mobileOpen,
  onMobileClose,
}: {
  role: AppRole;
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}) {
  const pathname = usePathname();
  const dict = useDictionary();
  const isAdmin = role === "admin";
  // The mobile drawer always renders at full width, so ignore the desktop
  // icon-only preference for inner content while it's open as an overlay.
  const effectiveCollapsed = mobileOpen ? false : collapsed;

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex h-full w-64 shrink-0 flex-col border-r border-gray-200 bg-white/95 backdrop-blur-sm transition-transform duration-300 ease-out md:relative md:z-10 md:translate-x-0 md:transition-[width] dark:border-gray-800 dark:bg-gray-950/95 ${mobileOpen ? "translate-x-0" : "-translate-x-full"} ${collapsed ? "md:w-18" : "md:w-64"}`}
    >
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 px-4.5 dark:border-gray-800">
        <Link
          href="/"
          className={`overflow-hidden transition-all duration-300 ease-in-out ${effectiveCollapsed ? "w-0 opacity-0" : "w-28 opacity-100"}`}
        >
          <div className="flex h-9 w-28 items-center">
            <Image
              src="/feedstudio.png"
              alt="feedstud.io"
              width={112}
              height={36}
              priority
              className="dark:brightness-0 dark:invert"
            />
          </div>
        </Link>
        <button
          type="button"
          onClick={onToggle}
          className="hidden size-9 shrink-0 items-center justify-center rounded-xl border bg-white text-gray-500 shadow-sm transition-all duration-300 ease-in-out hover:-translate-y-px hover:border-blue-300 hover:text-blue-700 md:inline-flex dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:border-blue-700 dark:hover:text-blue-400"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ListIcon size={18} weight="bold" />
          ) : (
            <CaretDoubleLeftIcon size={18} weight="bold" />
          )}
        </button>
        <button
          type="button"
          onClick={onMobileClose}
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl border bg-white text-gray-500 shadow-sm transition-all duration-300 ease-in-out hover:-translate-y-px hover:border-blue-300 hover:text-blue-700 md:hidden dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:border-blue-700 dark:hover:text-blue-400"
          aria-label="Close navigation menu"
        >
          <XIcon size={18} weight="bold" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3.5">
        <nav className="space-y-1" onClick={onMobileClose}>
          <SidebarNavItem
            href="/dashboard"
            icon={<HouseIcon size={18} weight="fill" />}
            label={dict.nav.home}
            active={pathname === "/dashboard"}
            collapsed={effectiveCollapsed}
          />
          <SidebarNavItem
            href="/dashboard/history"
            icon={<MegaphoneIcon size={18} />}
            label={dict.nav.myCampaigns}
            active={
              pathname === "/dashboard/history" ||
              pathname.startsWith("/dashboard/drafts/") ||
              pathname === "/dashboard/new"
            }
            collapsed={effectiveCollapsed}
          />
          <SidebarNavItem
            href="/dashboard/scheduled"
            icon={<CalendarBlankIcon size={18} />}
            label={dict.nav.scheduledPosts}
            active={pathname === "/dashboard/scheduled"}
            collapsed={effectiveCollapsed}
          />
          <SidebarNavItem
            href="/dashboard/profile"
            icon={<BrainIcon size={18} weight="fill" />}
            label={dict.nav.profile}
            active={pathname === "/dashboard/profile"}
            collapsed={effectiveCollapsed}
          />
          {isAdmin ? (
            <SidebarNavItem
              href="/dashboard/admin"
              icon={<ShieldIcon size={18} weight="fill" />}
              label={dict.nav.admin}
              active={pathname === "/dashboard/admin" || pathname.startsWith("/dashboard/admin/")}
              collapsed={effectiveCollapsed}
            />
          ) : null}
        </nav>
      </div>

      <div className="flex shrink-0 items-center justify-between border-t border-gray-200 px-4.5 py-4 dark:border-gray-800">
        <div
          className={`transition-all duration-300 ease-in-out ${effectiveCollapsed ? "pointer-events-none w-0 opacity-0" : "w-23 opacity-100"}`}
        >
          <div className="flex w-23 items-center gap-2">
            <ThemeToggle />
            <LanguageToggle direction="up" />
          </div>
        </div>
        <div className="flex size-9 shrink-0 items-center justify-center">
          <UserButton />
        </div>
      </div>
    </aside>
  );
}
