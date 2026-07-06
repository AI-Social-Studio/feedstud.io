import type { NextRequest } from "next/server";
import { createAuthedBackendProxy } from "@/lib/authenticated-backend-api-proxy";

export async function GET(request: NextRequest) {
  return createAuthedBackendProxy(request, "/memory/me", "GET");
}
