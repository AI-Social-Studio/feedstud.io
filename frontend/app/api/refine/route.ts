import { auth } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/flowforge-backend";

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ detail: "Unauthorized", code: "unauthorized" }, { status: 401 });
  }

  const payload = await request.json();
  const response = await backendFetch("/refine", {
    method: "POST",
    body: payload,
    headers: {
      "X-Actor-Id": userId,
    },
  });

  const text = await response.text();
  return new NextResponse(text, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("Content-Type") ?? "application/json",
    },
  });
}
