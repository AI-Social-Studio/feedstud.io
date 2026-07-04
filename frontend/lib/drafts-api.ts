import axios from "axios";
import type { Platform } from "@/components/studio/content-engine";

const draftsApi = axios.create({
  timeout: 60000,
});

export type UploadedFile = {
  id: string;
  filename: string;
  content_type: string;
  size_bytes: number;
  url: string;
  created_at: string;
};

export type DraftSummary = {
  id: string;
  title: string;
  selected_platforms: Platform[];
  posts_count: number;
  raw_text_preview: string;
  updated_at: string;
  created_at: string;
};

export type Draft = {
  id: string;
  title: string;
  raw: string;
  platforms: Platform[];
  posts: Partial<Record<Platform, string>>;
  file_ids: string[];
  created_at: string;
  updated_at: string;
  files: UploadedFile[];
};

export type SaveDraftRequest = {
  title?: string;
  raw: string;
  platforms: Platform[];
  posts: Partial<Record<Platform, string>>;
  file_ids: string[];
};

export async function createDraft(payload: SaveDraftRequest): Promise<Draft> {
  const response = await draftsApi.post<Draft>("/api/drafts", payload);
  return response.data;
}

export async function updateDraft(draftId: string, payload: SaveDraftRequest): Promise<Draft> {
  const response = await draftsApi.put<Draft>(`/api/drafts/${draftId}`, payload);
  return response.data;
}

export async function getDraft(draftId: string): Promise<Draft> {
  const response = await draftsApi.get<Draft>(`/api/drafts/${draftId}`);
  return response.data;
}

export async function listDrafts(limit = 50): Promise<DraftSummary[]> {
  const response = await draftsApi.get<DraftSummary[]>("/api/drafts", { params: { limit } });
  return response.data;
}
