import { auth } from "@clerk/nextjs/server";
import { backendJson } from "@/lib/backend-api-client";
import type { Publication, ScheduledPublication } from "@/lib/publications-api";

export async function listPublicationsServer(draftId: string): Promise<Publication[]> {
  const { userId } = await auth();
  if (!userId) return [];
  try {
    return await backendJson<Publication[]>(
      `/publications?draft_id=${encodeURIComponent(draftId)}`,
      {
        headers: { "X-Actor-Id": userId },
      },
    );
  } catch {
    return [];
  }
}

export async function listScheduledPublicationsServer(
  limit = 50,
  offset = 0,
): Promise<ScheduledPublication[]> {
  const { userId } = await auth();
  if (!userId) return [];
  return backendJson<ScheduledPublication[]>(
    `/publications/scheduled?limit=${limit}&offset=${offset}`,
    {
      headers: { "X-Actor-Id": userId },
    },
  );
}
