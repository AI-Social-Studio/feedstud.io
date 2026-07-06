import { auth } from "@clerk/nextjs/server";
import type { UserMemory } from "@/types/memory";
import { BackendRequestError, backendJson } from "@/lib/backend-api-client";

export async function getUserMemoryServer(): Promise<UserMemory | null> {
  const { userId } = await auth();
  if (!userId) return null;

  try {
    return await backendJson<UserMemory>("/memory/me", {
      headers: { "X-Actor-Id": userId },
    });
  } catch (error) {
    if (error instanceof BackendRequestError && error.status === 404) return null;
    throw error;
  }
}
