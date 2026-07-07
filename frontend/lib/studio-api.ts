import axios, { type AxiosError } from "axios";
import type { Platform, RefineAction } from "@/components/studio/content-engine";
import type { UploadedFile } from "@/lib/drafts-api";

const studioApi = axios.create({
  timeout: 60000,
});

const uploadsApi = axios.create({
  timeout: 60000,
});

export type GenerateRequest = {
  raw: string;
  platforms: Platform[];
  file_ids?: string[];
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

export type RefineRequest = {
  platform: Platform;
  text: string;
  action: RefineAction;
};

export type RefineResponse = {
  text: string;
};

export type UploadResponse = {
  files: UploadedFile[];
};

type ApiErrorPayload = {
  detail?: string | { msg?: string }[];
  code?: string;
  meta?: Record<string, unknown>;
};

export async function generatePosts(payload: GenerateRequest): Promise<GenerateResponse> {
  const accepted = await studioApi.post<GenerateAcceptedResponse>("/api/generate", payload);
  return waitForGenerateJob(accepted.data.job_id);
}

export async function refinePost(payload: RefineRequest): Promise<RefineResponse> {
  const response = await studioApi.post<RefineResponse>("/api/refine", payload);
  return response.data;
}

export async function uploadFiles(files: File[]): Promise<UploadResponse> {
  const formData = new FormData();
  for (const file of files) formData.append("files", file);
  const response = await uploadsApi.post<UploadResponse>("/api/uploads", formData);
  return response.data;
}

export async function deleteUpload(fileId: string): Promise<void> {
  await uploadsApi.delete(`/api/uploads/${fileId}`);
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
      const response = await studioApi.get<GenerateJobResponse>(`/api/generate/${jobId}`, {
        timeout: Math.min(remainingMs, 15_000),
      });

      if (response.data.status === "completed") {
        return {
          posts: response.data.posts,
          errors: response.data.errors,
        };
      }

      if (response.data.status === "failed") {
        const error = response.data.error;
        throw new Error(error?.detail || "Generowanie treści nie powiodło się");
      }

      transientFailures = 0;
    } catch (error) {
      if (!axios.isAxiosError(error)) throw error;
      transientFailures += 1;
      if (transientFailures >= 3) throw error;
    }

    await new Promise((resolve) => setTimeout(resolve, delayMs));
    delayMs = Math.min(delayMs * 1.5, 4000);
  }

  throw new Error("Generowanie trwa zbyt długo. Spróbuj ponownie.");
}
