import axios, { AxiosError } from "axios";
import type { Platform, RefineAction } from "@/components/studio/content-engine";
import { env } from "@/env";

const api = axios.create({
  baseURL: env.NEXT_PUBLIC_BACKEND_URL,
  timeout: 60000,
});

export type GenerateRequest = {
  raw: string;
  platforms: Platform[];
  file_ids?: string[];
};

export type GenerateResponse = {
  posts: Partial<Record<Platform, string>>;
  errors: Partial<Record<Platform, string>>;
};

export type RefineRequest = {
  platform: Platform;
  text: string;
  action: RefineAction;
};

export type RefineResponse = {
  text: string;
};

export type UploadedFile = {
  id: string;
  filename: string;
  content_type: string;
  size_bytes: number;
  url: string;
  created_at: string;
};

export type UploadResponse = {
  files: UploadedFile[];
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

type ApiErrorPayload = {
  detail?: string | { msg?: string }[];
  code?: string;
};

export async function generatePosts(payload: GenerateRequest): Promise<GenerateResponse> {
  const response = await api.post<GenerateResponse>("/generate", payload);
  return response.data;
}

export async function refinePost(payload: RefineRequest): Promise<RefineResponse> {
  const response = await api.post<RefineResponse>("/refine", payload);
  return response.data;
}

export async function uploadFiles(files: File[]): Promise<UploadResponse> {
  const formData = new FormData();
  for (const file of files) formData.append("files", file);
  const response = await api.post<UploadResponse>("/uploads", formData);
  return response.data;
}

export async function deleteUpload(fileId: string): Promise<void> {
  await api.delete(`/uploads/${fileId}`);
}

export async function createDraft(payload: SaveDraftRequest): Promise<Draft> {
  const response = await api.post<Draft>("/drafts", payload);
  return response.data;
}

export async function updateDraft(draftId: string, payload: SaveDraftRequest): Promise<Draft> {
  const response = await api.put<Draft>(`/drafts/${draftId}`, payload);
  return response.data;
}

export async function getDraft(draftId: string): Promise<Draft> {
  const response = await api.get<Draft>(`/drafts/${draftId}`);
  return response.data;
}

export async function listDrafts(limit = 50): Promise<DraftSummary[]> {
  const response = await api.get<DraftSummary[]>("/drafts", { params: { limit } });
  return response.data;
}

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorPayload>(error)) return fromAxiosError(error);
  if (error instanceof Error) return error.message;
  return "Wystąpił nieznany błąd";
}

function fromAxiosError(error: AxiosError<ApiErrorPayload>): string {
  const detail = error.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    const first = detail.find((item) => item?.msg);
    if (first?.msg) return first.msg;
  }
  if (error.code === "ECONNABORTED") return "Backend nie odpowiedział na czas";
  if (!error.response) return "Nie można połączyć się z backendem";
  return `Backend zwrócił błąd ${error.response.status}`;
}
