import "server-only";

import { cache } from "react";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  checkRole,
  getRoleFromPublicMetadata,
  getRoleFromSessionClaims,
  type AppRole,
} from "@/lib/auth/roles";

type RoleSource = "session_claims" | "public_metadata" | "default";

export type AuthContext = {
  userId: string;
  primaryEmailAddress: string | null;
  role: AppRole;
  roleSource: RoleSource;
};

const getCachedAuthContext = cache(async (): Promise<AuthContext | null> => {
  const { sessionClaims, userId } = await auth();
  if (!userId) return null;

  const user = await currentUser();
  const primaryEmailAddress = getPrimaryEmailAddress(user);
  const role = resolveRole({
    publicMetadata: user?.publicMetadata,
    sessionClaims,
  });

  return {
    userId,
    primaryEmailAddress,
    role: role.value,
    roleSource: role.source,
  };
});

export async function getAuthContext(): Promise<AuthContext | null> {
  return getCachedAuthContext();
}

export async function requireAuthContext(): Promise<AuthContext> {
  const context = await getAuthContext();
  if (!context) redirect("/sign-in");
  return context;
}

export async function requireAdminContext(): Promise<AuthContext> {
  const context = await requireAuthContext();
  if (!(await checkRole("admin"))) redirect("/dashboard");
  return context;
}

function getPrimaryEmailAddress(
  user: Awaited<ReturnType<typeof currentUser>>,
): string | null {
  if (!user) return null;

  const primary = user.emailAddresses.find((email) => email.id === user.primaryEmailAddressId);
  return primary?.emailAddress ?? user.emailAddresses[0]?.emailAddress ?? null;
}

function resolveRole({
  publicMetadata,
  sessionClaims,
}: {
  publicMetadata: unknown;
  sessionClaims: CustomJwtSessionClaims | null | undefined;
}): { value: AppRole; source: RoleSource } {
  const sessionRole = getRoleFromSessionClaims(sessionClaims);
  if (sessionRole) return { value: sessionRole, source: "session_claims" };

  const publicRole = getRoleFromPublicMetadata(publicMetadata);
  if (publicRole) return { value: publicRole, source: "public_metadata" };

  return { value: "user", source: "default" };
}
