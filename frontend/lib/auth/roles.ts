import "server-only";

import { cache } from "react";
import { auth, currentUser } from "@clerk/nextjs/server";

export const APP_ROLES = ["user", "admin"] as const;

export type AppRole = (typeof APP_ROLES)[number];

export function normalizeAppRole(value: unknown): AppRole | null {
  if (typeof value !== "string") return null;
  return APP_ROLES.includes(value as AppRole) ? (value as AppRole) : null;
}

export function getRoleFromSessionClaims(
  sessionClaims: CustomJwtSessionClaims | null | undefined,
): AppRole | null {
  return normalizeAppRole(sessionClaims?.metadata?.role);
}

export function getRoleFromPublicMetadata(publicMetadata: unknown): AppRole | null {
  if (!publicMetadata || typeof publicMetadata !== "object") return null;
  return normalizeAppRole((publicMetadata as { role?: unknown }).role);
}

export const getSessionAppRole = cache(async (): Promise<AppRole | null> => {
  const { sessionClaims } = await auth();
  return getRoleFromSessionClaims(sessionClaims);
});

export function checkSessionRole(
  role: AppRole,
  sessionClaims: CustomJwtSessionClaims | null | undefined,
): boolean {
  const sessionRole = getRoleFromSessionClaims(sessionClaims);
  if (!sessionRole) return false;
  if (role === "user") return sessionRole === "user" || sessionRole === "admin";
  return sessionRole === "admin";
}

export async function checkRole(role: AppRole): Promise<boolean> {
  const { userId } = await auth();
  if (!userId) return false;

  if (role === "admin") {
    const user = await currentUser();
    return getRoleFromPublicMetadata(user?.publicMetadata) === "admin";
  }

  return true;
}
