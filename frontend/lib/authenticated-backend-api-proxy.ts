import { auth } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend-api-client";

type ProxyMethod = "GET" | "POST" | "PUT" | "DELETE";

export async function createAuthedBackendProxy(
  request: NextRequest,
  path: string,
  method: ProxyMethod = "POST",
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ detail: "Unauthorized", code: "unauthorized" }, { status: 401 });
  }

  let payload: unknown;
  if (method !== "GET") {
    try {
      payload = await request.json();
    } catch {
      return NextResponse.json(
        { detail: "Invalid JSON payload", code: "invalid_payload" },
        { status: 400 },
      );
    }
  }

  let response: Response;
  try {
    response = await backendFetch(path, {
      method,
      body: payload,
      headers: {
        "X-Actor-Id": userId,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to reach backend";
    const isTimeout = error instanceof Error && error.message.includes("timed out");
    return NextResponse.json(
      { detail: message, code: isTimeout ? "backend_timeout" : "backend_unreachable" },
      { status: isTimeout ? 504 : 502 },
    );
  }

  const text = await response.text();
  return new NextResponse(text, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("Content-Type") ?? "application/json",
    },
  });
}

export async function createAuthedBackendMultipartProxy(
  request: NextRequest,
  path: string,
  method: Extract<ProxyMethod, "POST" | "PUT"> = "POST",
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ detail: "Unauthorized", code: "unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { detail: "Invalid multipart payload", code: "invalid_payload" },
      { status: 400 },
    );
  }

  let response: Response;
  try {
    response = await backendFetch(path, {
      method,
      rawBody: formData,
      headers: {
        "X-Actor-Id": userId,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to reach backend";
    const isTimeout = error instanceof Error && error.message.includes("timed out");
    return NextResponse.json(
      { detail: message, code: isTimeout ? "backend_timeout" : "backend_unreachable" },
      { status: isTimeout ? 504 : 502 },
    );
  }

  const text = await response.text();
  return new NextResponse(text, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("Content-Type") ?? "application/json",
    },
  });
}
