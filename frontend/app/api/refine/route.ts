import type { NextRequest } from "next/server";
import { createAuthedBackendProxy } from "@/lib/authenticated-backend-api-proxy";

export async function POST(request: NextRequest) {
  return createAuthedBackendProxy(request, "/refine");
}
