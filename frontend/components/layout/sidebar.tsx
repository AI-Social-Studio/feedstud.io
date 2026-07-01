"use client";

import { UserButton } from "@clerk/nextjs";
import { House, Megaphone } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import type { AppRole } from "@/lib/auth/roles";
import { useDictionary } from "@/lib/i18n";
import { SidebarNavItem } from "./sidebar-nav-item";

export function Sidebar({ role }: { role: AppRole }) {
  const pathname = usePathname();
  const dict = useDictionary();
  const isAdmin = role === "admin";

  return (
    <aside className="z-10 flex h-full w-64 flex-shrink-0 flex-col border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
      <div className="flex h-16 items-center border-b border-gray-200 px-8 dark:border-gray-800">
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
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-3 px-3 text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
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
            active={pathname === "/dashboard/history" || pathname.startsWith("/dashboard/drafts/") || pathname === "/dashboard/new"}
          />
        </nav>

        {isAdmin ? (
          <>
            <div className="mb-3 px-3 text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
              {dict.nav.adminSection}
            </div>
            <nav className="space-y-1">
              <SidebarNavItem
                href="/dashboard/admin"
                icon={<span className="h-2.5 w-2.5 rounded-full bg-violet-500" />}
                label={dict.nav.admin}
                active={pathname === "/dashboard/admin" || pathname.startsWith("/dashboard/admin/")}
              />
            </nav>
          </>
        ) : null}
      </div>

      <div className="flex items-center justify-between border-t border-gray-200 p-4 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LanguageToggle />
        </div>
        <UserButton />
      </div>
    </aside>
  );
}
