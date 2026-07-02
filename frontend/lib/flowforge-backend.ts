import "server-only";

import { env } from "@/env";

const BACKEND_TIMEOUT_MS = 65_000;

export class BackendRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "BackendRequestError";
  }
}

type BackendRequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  headers?: HeadersInit;
  cache?: RequestCache;
};

export async function backendFetch(
  path: string,
  options: BackendRequestOptions = {},
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), BACKEND_TIMEOUT_MS);

  try {
    return await fetch(`${env.BACKEND_URL}/api/v1${path}`, {
      method: options.method ?? "GET",
      cache: options.cache ?? "no-store",
      headers: {
        "Content-Type": "application/json",
        ...(env.BACKEND_INTERNAL_API_KEY
          ? { "X-Backend-Token": env.BACKEND_INTERNAL_API_KEY }
          : {}),
        ...options.headers,
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error(`Backend request timed out after ${BACKEND_TIMEOUT_MS}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function backendJson<T>(
  path: string,
  options?: BackendRequestOptions,
): Promise<T> {
  const response = await backendFetch(path, options);
  if (!response.ok) {
    throw new BackendRequestError(await readBackendError(response, path), response.status);
  }
  return (await response.json()) as T;
}

async function readBackendError(response: Response, path: string): Promise<string> {
  const text = await response.text();
  if (!text) return `Backend request failed: ${response.status} ${path}`;

  try {
    const payload = JSON.parse(text) as { detail?: string; message?: string; error?: string };
    if (typeof payload.detail === "string" && payload.detail) return payload.detail;
    if (typeof payload.message === "string" && payload.message) return payload.message;
    if (typeof payload.error === "string" && payload.error) return payload.error;
  } catch {
    return text;
  }

  return text;
}
