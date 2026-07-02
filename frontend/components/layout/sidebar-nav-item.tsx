import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  href: string;
  icon: ReactNode;
  label: string;
  active?: boolean;
  collapsed?: boolean;
};

export function SidebarNavItem({ href, icon, label, active, collapsed = false }: Props) {
  const base = collapsed
    ? "flex h-11 w-11 items-center justify-center rounded-xl text-sm font-medium transition-all duration-200"
    : "flex h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium transition-all duration-200 overflow-hidden";
  const state = active
    ? "text-blue-700 bg-blue-50/80 dark:text-blue-400 dark:bg-blue-500/10"
    : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800/60";

  return (
    <Link
      href={href}
      className={`${base} ${state}`}
      aria-label={collapsed ? label : undefined}
      title={collapsed ? label : undefined}
    >
      <span className="shrink-0">{icon}</span>
      <span
        className={`overflow-hidden whitespace-nowrap transition-all duration-200 ${
          collapsed ? "max-w-0 -translate-x-1 opacity-0" : "max-w-[140px] translate-x-0 opacity-100"
        }`}
      >
        {label}
      </span>
    </Link>
  );
}
