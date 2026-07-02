import axios, { type AxiosError } from "axios";
import type { Platform, RefineAction } from "@/components/studio/content-engine";
import { env } from "@/env";

const api = axios.create({
  baseURL: env.NEXT_PUBLIC_BACKEND_URL,
  timeout: 60000,
});

const trustedApi = axios.create({
  timeout: 60000,
});

export type GenerateRequest = {
  raw: string;
  platforms: Platform[];
  file_ids?: string[];
};

export type GenerateResponse = {
  posts: Partial<Record<Platform, string>>;
  errors: Partial<Record<Platform, GenerateErrorInfo>>;
};

type GenerateAcceptedResponse = {
  job_id: string;
  status: "queued";
};

type GenerateJobResponse = GenerateResponse & {
  job_id: string;
  status: "queued" | "processing" | "completed" | "failed";
  error?: {
    code: string;
    detail: string;
    meta?: Record<string, unknown>;
  } | null;
};

export type GenerateErrorCode =
  | "content_generation_failed"
  | "invalid_model_output"
  | "model_empty_output";

export type GenerateErrorInfo = {
  code: GenerateErrorCode;
  detail: string;
  meta?: Record<string, unknown>;
};

export type RefineRequest = {
  platform: Platform;
  text: string;
  action: RefineAction;
};

export type RefineResponse = {
  text: string;
};

export type AiUsageSummary = {
  total_requests: number;
  success_requests: number;
  error_requests: number;
  total_cost: number;
  total_prompt_tokens: number;
  total_completion_tokens: number;
  total_tokens: number;
  total_cached_tokens: number;
  total_reasoning_tokens: number;
  average_cost_per_request: number;
};

export type AiExecutionListItem = {
  id: string;
  created_at: string;
  kind: string;
  status: string;
  user_id: string | null;
  platform: string | null;
  action: string | null;
  provider: string;
  requested_model: string;
  resolved_model: string | null;
  resolved_provider: string | null;
  generation_id: string | null;
  request_id: string | null;
  finish_reason: string | null;
  native_finish_reason: string | null;
  prompt_tokens: number | null;
  completion_tokens: number | null;
  total_tokens: number | null;
  cost: number | null;
  latency_ms: number | null;
  error_message: string | null;
};

export type AiUsage = {
  prompt_tokens: number | null;
  completion_tokens: number | null;
  total_tokens: number | null;
  cost: number | null;
  cached_tokens: number | null;
  reasoning_tokens: number | null;
  prompt_cost: number | null;
  completion_cost: number | null;
  total_upstream_cost: number | null;
};

export type AiExecutionDetail = {
  id: string;
  created_at: string;
  kind: string;
  status: string;
  user_id: string | null;
  platform: string | null;
  action: string | null;
  provider: string;
  requested_model: string;
  resolved_model: string | null;
  resolved_provider: string | null;
  generation_id: string | null;
  request_id: string | null;
  upstream_id: string | null;
  finish_reason: string | null;
  native_finish_reason: string | null;
  system_prompt: string;
  user_prompt: string;
  messages: Array<Record<string, unknown>>;
  response_text: string | null;
  response_reasoning: string | null;
  response_reasoning_details: Array<Record<string, unknown>> | null;
  usage: AiUsage;
  latency_ms: number | null;
  generation_time_ms: number | null;
  provider_responses: Array<Record<string, unknown>> | null;
  raw_completion_response: Record<string, unknown> | null;
  raw_generation_response: Record<string, unknown> | null;
  error_message: string | null;
  error_json: Record<string, unknown> | null;
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
  meta?: Record<string, unknown>;
};

export async function generatePosts(payload: GenerateRequest): Promise<GenerateResponse> {
  const accepted = await trustedApi.post<GenerateAcceptedResponse>("/api/generate", payload);
  return waitForGenerateJob(accepted.data.job_id);
}

export async function refinePost(payload: RefineRequest): Promise<RefineResponse> {
  const response = await trustedApi.post<RefineResponse>("/api/refine", payload);
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

async function waitForGenerateJob(jobId: string): Promise<GenerateResponse> {
  const deadline = Date.now() + 90_000;
  let delayMs = 1000;
  let transientFailures = 0;

  while (Date.now() < deadline) {
    const remainingMs = deadline - Date.now();
    if (remainingMs <= 0) break;

    try {
      const response = await trustedApi.get<GenerateJobResponse>(`/api/generate/${jobId}`, {
        timeout: remainingMs,
      });
      transientFailures = 0;
      if (response.data.status === "completed") {
        return {
          posts: response.data.posts,
          errors: response.data.errors,
        };
      }
      if (response.data.status === "failed") {
        throw new Error(response.data.error?.detail ?? "Generowanie nie powiodło się");
      }
    } catch (error) {
      const retryDelayMs = Math.min(delayMs, Math.max(deadline - Date.now(), 0));
      if (!isTransientGeneratePollError(error) || transientFailures >= 3 || retryDelayMs <= 0) {
        throw error;
      }
      transientFailures += 1;
    }
    const sleepMs = Math.min(delayMs, Math.max(deadline - Date.now(), 0));
    if (sleepMs <= 0) break;
    await new Promise((resolve) => window.setTimeout(resolve, sleepMs));
    delayMs = Math.min(delayMs + 1000, 5000);
  }

  throw new Error("Backend nie odpowiedział na czas");
}

function isTransientGeneratePollError(error: unknown): boolean {
  if (!axios.isAxiosError(error)) return false;
  if (!error.response) return true;
  return [502, 503, 504].includes(error.response.status);
}
