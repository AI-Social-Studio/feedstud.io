export const SIDEBAR_COLLAPSED_COOKIE_NAME = "dashboard-sidebar-collapsed";

export function parseSidebarCollapsed(value: string | undefined): boolean {
  return value === "true";
}
