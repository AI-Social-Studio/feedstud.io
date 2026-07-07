import type { NextRequest } from "next/server";
import { createAuthedBackendProxy } from "@/lib/authenticated-backend-api-proxy";

type RouteContext = {
  params: Promise<{ connectionId: string }>;
};

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { connectionId } = await context.params;
  return createAuthedBackendProxy(request, `/social-connections/${connectionId}`, "DELETE");
}
