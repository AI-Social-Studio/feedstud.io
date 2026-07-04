import { auth } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { backendJson } from "@/lib/backend-api-client";

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const error = request.nextUrl.searchParams.get("error");
  if (error) {
    return NextResponse.redirect(new URL("/dashboard?linkedin=error", request.url));
  }
  if (!code || !state) {
    return NextResponse.redirect(new URL("/dashboard?linkedin=error", request.url));
  }

  const redirectUri = new URL("/api/social-connections/linkedin/callback", request.url).toString();
  const params = new URLSearchParams({ code, state, redirect_uri: redirectUri });

  try {
    await backendJson(`/social-connections/linkedin/callback?${params.toString()}`, {
      headers: { "X-Actor-Id": userId },
    });
    return NextResponse.redirect(new URL("/dashboard?linkedin=connected", request.url));
  } catch {
    return NextResponse.redirect(new URL("/dashboard?linkedin=error", request.url));
  }
}
