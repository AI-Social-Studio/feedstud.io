"use client";

import { UserButton } from "@clerk/nextjs";
import { House, List, Megaphone, Shield, X } from "@phosphor-icons/react/dist/ssr";
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
}: {
  role: AppRole;
  collapsed: boolean;
  onToggle: () => void;
}) {
  const pathname = usePathname();
  const dict = useDictionary();
  const isAdmin = role === "admin";

  return (
    <aside
      className={`relative z-10 flex h-full flex-shrink-0 flex-col border-r border-gray-200 bg-white/95 backdrop-blur-sm transition-[width] duration-300 ease-out dark:border-gray-800 dark:bg-gray-950/95 ${collapsed ? "w-[72px]" : "w-64"}`}
    >
      <div
        className={`flex h-16 items-center border-b border-gray-200 dark:border-gray-800 ${collapsed ? "justify-center px-0" : "justify-between px-5"}`}
      >
        <Link
          href="/"
          className={`overflow-hidden transition-all duration-200 ${collapsed ? "w-0 opacity-0" : "w-[112px] opacity-100"}`}
        >
          <div className="flex h-9 items-center">
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
          className={`inline-flex items-center justify-center border text-gray-500 transition-all duration-200 hover:-translate-y-px hover:border-blue-300 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:border-blue-700 dark:hover:text-blue-400 ${collapsed ? "size-10 rounded-2xl bg-gray-50 shadow-sm dark:bg-gray-900" : "size-9 rounded-xl bg-white"}`}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <List size={18} weight="bold" /> : <X size={18} weight="bold" />}
        </button>
      </div>

      <div className={`flex-1 overflow-y-auto ${collapsed ? "px-0 py-4" : "p-4"}`}>
        <nav className={`space-y-1 ${collapsed ? "flex flex-col items-center" : ""}`}>
          <SidebarNavItem
            href="/dashboard"
            icon={<House size={18} weight="fill" />}
            label={dict.nav.home}
            active={pathname === "/dashboard"}
            collapsed={collapsed}
          />
          <SidebarNavItem
            href="/dashboard/history"
            icon={<Megaphone size={18} />}
            label={dict.nav.myCampaigns}
            active={
              pathname === "/dashboard/history" ||
              pathname.startsWith("/dashboard/drafts/") ||
              pathname === "/dashboard/new"
            }
            collapsed={collapsed}
          />
          {isAdmin ? (
            <SidebarNavItem
              href="/dashboard/admin"
              icon={<Shield size={18} weight="fill" />}
              label={dict.nav.admin}
              active={
                pathname === "/dashboard/admin" || pathname.startsWith("/dashboard/admin/")
              }
              collapsed={collapsed}
            />
          ) : null}
        </nav>
      </div>

      <div
        className={`border-t border-gray-200 dark:border-gray-800 ${collapsed ? "px-0 py-4" : "p-4"}`}
      >
        <div className={`flex items-center ${collapsed ? "justify-center" : "justify-between"}`}>
          <div
            className={`overflow-hidden transition-all duration-200 ${collapsed ? "w-0 opacity-0" : "w-[92px] opacity-100"}`}
          >
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <LanguageToggle />
            </div>
          </div>
          <UserButton />
        </div>
      </div>
    </aside>
  );
}
