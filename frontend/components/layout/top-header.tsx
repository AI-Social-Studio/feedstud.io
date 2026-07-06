"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Brain,
    CaretRight,
    House,
    HouseIcon,
    List,
    ListIcon,
    Megaphone, MegaphoneIcon,
    Shield,
    ShieldIcon
} from "@phosphor-icons/react/dist/ssr";
import { useDictionary } from "@/lib/i18n";
import {BrainIcon, CaretRightIcon} from "@phosphor-icons/react";

export function TopHeader({ onOpenMobileNav }: { onOpenMobileNav: () => void }) {
  const pathname = usePathname();
  const dict = useDictionary();
  const isHome = pathname === "/dashboard";
  const isProfile = pathname === "/dashboard/profile";
  const isMyCampaigns = pathname === "/dashboard/history";
  const isNewCampaign = pathname === "/dashboard/new";
  const isAdmin = pathname === "/dashboard/admin" || pathname.startsWith("/dashboard/admin/");
  const isDraft = pathname.startsWith("/dashboard/drafts/");
  const isUnderMyCampaigns = isMyCampaigns || isNewCampaign || isDraft;

  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-gray-200 bg-white px-4 sm:px-8 dark:border-gray-800 dark:bg-gray-950">
      <button
        type="button"
        onClick={onOpenMobileNav}
        className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 shadow-sm md:hidden dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400"
        aria-label="Open navigation menu"
      >
        <ListIcon size={18} weight="bold" />
      </button>
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
        {isHome ? (
          <span className="flex items-center gap-1.5 font-medium text-gray-900 dark:text-gray-100">
            <HouseIcon size={16} weight="fill" />
            <span>{dict.nav.home}</span>
          </span>
        ) : isProfile ? (
          <span className="flex items-center gap-1.5 font-medium text-gray-900 dark:text-gray-100">
            <BrainIcon size={16} weight="fill" />
            <span>{dict.nav.profile}</span>
          </span>
        ) : isAdmin ? (
          <span className="flex items-center gap-1.5 font-medium text-gray-900 dark:text-gray-100">
            <ShieldIcon size={16} weight="fill" />
            <span>{dict.nav.admin}</span>
          </span>
        ) : isUnderMyCampaigns ? (
          isMyCampaigns ? (
            <span className="flex items-center gap-1.5 font-medium text-gray-900 dark:text-gray-100">
              <MegaphoneIcon size={16} weight="fill" />
              <span>{dict.nav.myCampaigns}</span>
            </span>
          ) : (
            <Link
              href="/dashboard/history"
              className="flex items-center gap-1.5 text-gray-400 transition-colors hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            >
              <MegaphoneIcon size={16} weight="fill" />
              <span>{dict.nav.myCampaigns}</span>
            </Link>
          )
        ) : (
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-gray-400 transition-colors hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          >
            <HouseIcon size={16} weight="fill" />
            <span>{dict.nav.home}</span>
          </Link>
        )}

        {isNewCampaign ? (
          <>
            <CaretRightIcon size={12} className="text-gray-300 dark:text-gray-700" />
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {dict.nav.newCampaign}
            </span>
          </>
        ) : isDraft ? (
          <>
            <CaretRightIcon size={12} className="text-gray-300 dark:text-gray-700" />
            <span className="font-medium text-gray-900 dark:text-gray-100">{dict.nav.draft}</span>
          </>
        ) : null}
      </nav>
    </header>
  );
}
