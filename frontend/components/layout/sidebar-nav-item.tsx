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
  const base =
    "flex h-11 w-full items-center rounded-xl px-[13px] text-sm font-medium transition-all duration-300 ease-in-out overflow-hidden";
  const state = active
    ? "bg-blue-50/80 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
    : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800/60";

  return (
    <Link
      href={href}
      className={`${base} ${state}`}
      aria-label={collapsed ? label : undefined}
      title={collapsed ? label : undefined}
    >
      <span className="flex size-[18px] shrink-0 items-center justify-center">{icon}</span>
      <div
        className={`flex items-center overflow-hidden transition-all duration-300 ease-in-out ${
          collapsed ? "w-0 opacity-0" : "w-full opacity-100"
        }`}
      >
        <span className="pl-3 whitespace-nowrap">{label}</span>
      </div>
    </Link>
  );
}
