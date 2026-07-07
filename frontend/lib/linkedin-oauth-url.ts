import type { NextRequest } from "next/server";

const LOCALHOST_ALIASES = new Set(["0.0.0.0", "127.0.0.1"]);

export function buildLinkedInCallbackUrl(request: NextRequest): string {
  const url = new URL("/api/social-connections/linkedin/callback", request.url);

  // LinkedIn redirect URL matching is exact. Normalize common local dev hosts
  // to the whitelisted localhost callback.
  if (LOCALHOST_ALIASES.has(url.hostname)) {
    url.hostname = "localhost";
  }

  return url.toString();
}

export function buildLocalAppUrl(request: NextRequest, path: string): URL {
  const url = new URL(path, request.url);

  if (LOCALHOST_ALIASES.has(url.hostname)) {
    url.hostname = "localhost";
  }

  return url;
}

export function toErrorLog(error: unknown): Record<string, string> {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
    };
  }

  return {
    message: String(error),
  };
}
