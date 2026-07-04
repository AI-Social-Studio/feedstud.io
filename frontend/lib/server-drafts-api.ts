import type { Draft, DraftSummary } from "@/lib/drafts-api";
import { auth } from "@clerk/nextjs/server";
import { BackendRequestError, backendJson } from "@/lib/backend-api-client";

export async function fetchDraftServer(draftId: string): Promise<Draft | null> {
  try {
    const { userId } = await auth();
    if (!userId) return null;
    return await backendJson<Draft>(`/drafts/${encodeURIComponent(draftId)}`, {
      headers: { "X-Actor-Id": userId },
    });
  } catch (error) {
    if (error instanceof BackendRequestError && error.status === 404) return null;
    throw error;
  }
}

export async function listDraftsServer(limit = 50): Promise<DraftSummary[]> {
  const { userId } = await auth();
  if (!userId) return [];
  return backendJson<DraftSummary[]>(`/drafts?limit=${limit}`, {
    headers: { "X-Actor-Id": userId },
  });
}
