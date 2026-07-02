"use client";

import { UserButton } from "@clerk/nextjs";
import { House, List, Megaphone, Shield, CaretDoubleLeft } from "@phosphor-icons/react/dist/ssr";
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
      <div className="flex h-16 flex-shrink-0 items-center justify-between border-b border-gray-200 px-[18px] dark:border-gray-800">
        <Link
          href="/"
          className={`overflow-hidden transition-all duration-300 ease-in-out ${collapsed ? "w-0 opacity-0" : "w-[112px] opacity-100"}`}
        >
          <div className="flex h-9 w-[112px] items-center">
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
          className="inline-flex size-9 flex-shrink-0 items-center justify-center rounded-xl border bg-white text-gray-500 shadow-sm transition-all duration-300 ease-in-out hover:-translate-y-px hover:border-blue-300 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:border-blue-700 dark:hover:text-blue-400"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <List size={18} weight="bold" /> : <CaretDoubleLeft size={18} weight="bold" />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-[14px]">
        <nav className="space-y-1">
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

      <div className="flex flex-shrink-0 items-center justify-between border-t border-gray-200 px-[18px] py-4 dark:border-gray-800">
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${collapsed ? "w-0 opacity-0" : "w-[92px] opacity-100"}`}
        >
          <div className="flex w-[92px] items-center gap-2">
            <ThemeToggle />
            <LanguageToggle />
          </div>
        </div>
        <div className="flex size-9 flex-shrink-0 items-center justify-center">
          <UserButton />
        </div>
      </div>
    </aside>
  );
}
