import type { NextRequest } from "next/server";
import { createAuthedBackendProxy } from "@/lib/authenticated-backend-api-proxy";

type Props = {
  params: Promise<{
    publicationId: string;
  }>;
};

export async function POST(request: NextRequest, { params }: Props) {
  const { publicationId } = await params;
  return createAuthedBackendProxy(request, `/publications/${publicationId}/reschedule`);
}
