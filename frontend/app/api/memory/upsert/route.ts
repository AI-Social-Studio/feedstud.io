import type { NextRequest } from "next/server";
import { createAuthedBackendProxy } from "@/lib/authenticated-backend-api-proxy";

export async function PUT(request: NextRequest) {
  return createAuthedBackendProxy(request, "/memory/upsert", "PUT");
}
