import type { NextRequest } from "next/server";
import { createAuthedBackendProxy } from "@/lib/authenticated-backend-api-proxy";

type RouteContext = {
  params: Promise<{ draftId: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const { draftId } = await context.params;
  return createAuthedBackendProxy(request, `/drafts/${draftId}`, "GET");
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const { draftId } = await context.params;
  return createAuthedBackendProxy(request, `/drafts/${draftId}`, "PUT");
}
