import "server-only";

import { env } from "@/env";

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
  const response = await fetch(`${env.BACKEND_URL}/api/v1${path}`, {
    method: options.method ?? "GET",
    cache: options.cache ?? "no-store",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  return response;
}

export async function backendJson<T>(
  path: string,
  options?: BackendRequestOptions,
): Promise<T> {
  const response = await backendFetch(path, options);
  if (!response.ok) {
    throw new Error(`Backend request failed: ${response.status} ${path}`);
  }
  return (await response.json()) as T;
}
