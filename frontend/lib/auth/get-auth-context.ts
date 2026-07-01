import "server-only";

import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { normalizeAppRole, type AppRole } from "@/lib/auth/roles";

type RoleSource = "session_claims" | "public_metadata" | "default";

export type AuthContext = {
  userId: string;
  primaryEmailAddress: string | null;
  role: AppRole;
  roleSource: RoleSource;
};

export async function getAuthContext(): Promise<AuthContext | null> {
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
}

export async function requireAuthContext(): Promise<AuthContext> {
  const context = await getAuthContext();
  if (!context) redirect("/sign-in");
  return context;
}

export async function requireAdminContext(): Promise<AuthContext> {
  const context = await requireAuthContext();
  if (context.role !== "admin") redirect("/dashboard");
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
  sessionClaims: Awaited<ReturnType<typeof auth>>["sessionClaims"];
}): { value: AppRole; source: RoleSource } {
  const sessionRole = normalizeAppRole(getMetadataRole(sessionClaims));
  if (sessionRole) return { value: sessionRole, source: "session_claims" };

  const publicRole = normalizeAppRole(getMetadataRole(publicMetadata));
  if (publicRole) return { value: publicRole, source: "public_metadata" };

  return { value: "user", source: "default" };
}

function getMetadataRole(metadata: unknown): unknown {
  if (!metadata || typeof metadata !== "object") return null;

  const role = (metadata as { metadata?: unknown; role?: unknown }).metadata;
  if (role && typeof role === "object") {
    return (role as { role?: unknown }).role;
  }

  return (metadata as { role?: unknown }).role ?? null;
}
