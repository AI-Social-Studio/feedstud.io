import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  href: string;
  icon: ReactNode;
  label: string;
  active?: boolean;
};

export function SidebarNavItem({ href, icon, label, active }: Props) {
  const base =
    "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150";
  const state = active
    ? "text-blue-700 bg-blue-50/80 dark:text-blue-400 dark:bg-blue-500/10"
    : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800/60";

  return (
    <Link href={href} className={`${base} ${state}`}>
      {icon}
      {label}
    </Link>
  );
}
