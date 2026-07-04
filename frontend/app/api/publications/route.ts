import type { NextRequest } from "next/server";
import { createAuthedBackendProxy } from "@/lib/authenticated-backend-api-proxy";

export async function POST(request: NextRequest) {
  return createAuthedBackendProxy(request, "/publications");
}

export async function GET(request: NextRequest) {
  const search = request.nextUrl.search;
  return createAuthedBackendProxy(request, `/publications${search}`, "GET");
}
