import type { NextRequest } from "next/server";
import { createAuthedBackendProxy } from "@/lib/authenticated-backend-api-proxy";

export async function GET(request: NextRequest) {
  const search = request.nextUrl.search;
  return createAuthedBackendProxy(request, `/publications/scheduled${search}`, "GET");
}
