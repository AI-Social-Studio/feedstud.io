"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CaretRight, House } from "@phosphor-icons/react/dist/ssr";

export function TopHeader() {
  const pathname = usePathname();
  const isAdmin = pathname === "/dashboard/admin" || pathname.startsWith("/dashboard/admin/");
  const isHistory = pathname === "/dashboard/history";
  const isDraft = pathname.startsWith("/dashboard/drafts/");

  return (
    <header className="flex h-16 flex-shrink-0 items-center border-b border-gray-200 bg-white px-8">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 text-gray-400 transition-colors hover:text-gray-600"
        >
          <House size={16} weight="fill" />
          <span>Overview</span>
        </Link>

        {isAdmin ? (
          <>
            <CaretRight size={12} className="text-gray-300" />
            <span className="font-medium text-gray-900">Admin Workspace</span>
          </>
        ) : isHistory ? (
          <>
            <CaretRight size={12} className="text-gray-300" />
            <span className="font-medium text-gray-900">History</span>
          </>
        ) : isDraft ? (
          <>
            <CaretRight size={12} className="text-gray-300" />
            <Link href="/dashboard/history" className="text-gray-400 transition-colors hover:text-gray-600">
              History
            </Link>
            <CaretRight size={12} className="text-gray-300" />
            <span className="font-medium text-gray-900">Draft</span>
          </>
        ) : (
          <>
            <CaretRight size={12} className="text-gray-300" />
            <span className="font-medium text-gray-900">New AI Campaign</span>
          </>
        )}
      </nav>
    </header>
  );
}
