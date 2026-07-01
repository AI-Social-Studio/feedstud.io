export const APP_ROLES = ["user", "admin"] as const;

export type AppRole = (typeof APP_ROLES)[number];

export function normalizeAppRole(value: unknown): AppRole | null {
  if (typeof value !== "string") return null;
  return APP_ROLES.includes(value as AppRole) ? (value as AppRole) : null;
}
