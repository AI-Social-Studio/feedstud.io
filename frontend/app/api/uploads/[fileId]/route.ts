import type { NextRequest } from "next/server";
import { createAuthedBackendProxy } from "@/lib/authenticated-backend-api-proxy";

type RouteContext = {
  params: Promise<{ fileId: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const { fileId } = await context.params;
  return createAuthedBackendProxy(request, `/uploads/${fileId}`, "GET");
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { fileId } = await context.params;
  return createAuthedBackendProxy(request, `/uploads/${fileId}`, "DELETE");
}
