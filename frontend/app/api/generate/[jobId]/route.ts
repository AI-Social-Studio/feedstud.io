import type { NextRequest } from "next/server";
import { createAuthedBackendProxy } from "@/lib/authed-backend-proxy";

type RouteContext = {
  params: Promise<{ jobId: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const { jobId } = await context.params;
  return createAuthedBackendProxy(request, `/generate/${jobId}`, "GET");
}
