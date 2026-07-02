"use client";

import { useEffect, useState } from "react";
import { UserButton } from "@clerk/nextjs";
import { House, List, Megaphone, X } from "@phosphor-icons/react/dist/ssr";
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
  const [showExpandedContent, setShowExpandedContent] = useState(!collapsed);

  useEffect(() => {
    const timeout = window.setTimeout(
      () => setShowExpandedContent(!collapsed),
      collapsed ? 0 : 140,
    );
    return () => window.clearTimeout(timeout);
  }, [collapsed]);

  return (
    <aside
      className={`relative z-10 flex h-full flex-shrink-0 flex-col border-r border-gray-200 bg-white/95 backdrop-blur-sm transition-all duration-200 dark:border-gray-800 dark:bg-gray-950/95 ${collapsed ? "w-16" : "w-64"}`}
    >
      <div
        className={`flex h-16 items-center border-b border-gray-200 dark:border-gray-800 ${collapsed ? "justify-center px-0" : "justify-between px-8"}`}
      >
        {!collapsed && showExpandedContent ? (
          <Link href="/">
            <Image
              src="/socialstudio.png"
              alt="socialstudio.ai"
              width={99}
              height={32}
              priority
              className="dark:brightness-0 dark:invert"
            />
          </Link>
        ) : null}
        <button
          type="button"
          onClick={onToggle}
          className={`inline-flex items-center justify-center border text-gray-500 transition-all duration-150 hover:-translate-y-px hover:border-blue-300 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:border-blue-700 dark:hover:text-blue-400 ${collapsed ? "size-10 rounded-xl bg-gray-50 shadow-sm dark:bg-gray-900" : "size-9 rounded-lg bg-white"}`}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <List size={18} weight="bold" /> : <X size={18} weight="bold" />}
        </button>
      </div>

      {collapsed || !showExpandedContent ? (
        <div className="flex flex-1 flex-col items-center gap-3 px-0 py-4">
          <SidebarNavItem
            href="/dashboard"
            icon={<House size={18} weight="fill" />}
            label={dict.nav.home}
            active={pathname === "/dashboard"}
            collapsed
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
            collapsed
          />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 transition-opacity duration-150">
          <div className="mb-3 px-3 text-xs font-medium tracking-wider whitespace-nowrap text-gray-400 uppercase dark:text-gray-500">
            {dict.nav.mainMenu}
          </div>
          <nav className="mb-8 space-y-1">
            <SidebarNavItem
              href="/dashboard"
              icon={<House size={18} weight="fill" />}
              label={dict.nav.home}
              active={pathname === "/dashboard"}
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
            />
          </nav>

          {isAdmin ? (
            <>
              <div className="mb-3 px-3 text-xs font-medium tracking-wider whitespace-nowrap text-gray-400 uppercase dark:text-gray-500">
                {dict.nav.adminSection}
              </div>
              <nav className="space-y-1">
                <SidebarNavItem
                  href="/dashboard/admin"
                  icon={<span className="size-2.5 rounded-full bg-violet-500" />}
                  label={dict.nav.admin}
                  active={
                    pathname === "/dashboard/admin" || pathname.startsWith("/dashboard/admin/")
                  }
                />
              </nav>
            </>
          ) : null}
        </div>
      )}

      <div
        className={`border-t border-gray-200 p-4 dark:border-gray-800 ${collapsed ? "flex justify-center px-0" : "flex items-center justify-between"}`}
      >
        {collapsed ? (
          <UserButton />
        ) : (
          <>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <LanguageToggle />
            </div>
            <UserButton />
          </>
        )}
      </div>
    </aside>
  );
}
