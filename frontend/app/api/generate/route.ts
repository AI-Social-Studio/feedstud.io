import type { NextRequest } from "next/server";
import { createAuthedBackendProxy } from "@/lib/authed-backend-proxy";

export async function POST(request: NextRequest) {
  return createAuthedBackendProxy(request, "/generate");
}
