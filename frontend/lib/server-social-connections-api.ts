import { auth } from "@clerk/nextjs/server";
import { backendJson } from "@/lib/backend-api-client";
import type { SocialConnection } from "@/lib/social-connections-api";

export async function listSocialConnectionsServer(): Promise<SocialConnection[]> {
  const { userId } = await auth();
  if (!userId) return [];
  return backendJson<SocialConnection[]>("/social-connections", {
    headers: { "X-Actor-Id": userId },
  });
}
