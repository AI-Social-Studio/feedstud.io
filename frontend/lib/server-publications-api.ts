import { auth } from "@clerk/nextjs/server";
import { backendJson } from "@/lib/backend-api-client";
import type { Publication } from "@/lib/publications-api";

export async function listPublicationsServer(draftId: string): Promise<Publication[]> {
  const { userId } = await auth();
  if (!userId) return [];
  return backendJson<Publication[]>(`/publications?draft_id=${encodeURIComponent(draftId)}`, {
    headers: { "X-Actor-Id": userId },
  });
}
