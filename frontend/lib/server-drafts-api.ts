import type { Draft, DraftSummary } from "@/lib/drafts-api";
import { BackendRequestError, backendJson } from "@/lib/backend-api-client";

export async function fetchDraftServer(draftId: string): Promise<Draft | null> {
  try {
    return await backendJson<Draft>(`/drafts/${encodeURIComponent(draftId)}`);
  } catch (error) {
    if (error instanceof BackendRequestError && error.status === 404) return null;
    throw error;
  }
}

export async function listDraftsServer(limit = 50): Promise<DraftSummary[]> {
  return backendJson<DraftSummary[]>(`/drafts?limit=${limit}`);
}
