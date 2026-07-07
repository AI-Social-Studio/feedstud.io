import { auth } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { backendJson } from "@/lib/backend-api-client";
import { buildLinkedInCallbackUrl, buildLocalAppUrl, toErrorLog } from "@/lib/linkedin-oauth-url";

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.redirect(buildLocalAppUrl(request, "/sign-in"));
  }

  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const error = request.nextUrl.searchParams.get("error");
  if (error) {
    return NextResponse.redirect(buildLocalAppUrl(request, "/dashboard?linkedin=error"));
  }
  if (!code || !state) {
    return NextResponse.redirect(buildLocalAppUrl(request, "/dashboard?linkedin=error"));
  }

  const redirectUri = buildLinkedInCallbackUrl(request);
  const params = new URLSearchParams({ code, state, redirect_uri: redirectUri });

  try {
    await backendJson(`/social-connections/linkedin/callback?${params.toString()}`, {
      headers: { "X-Actor-Id": userId },
    });
    return NextResponse.redirect(buildLocalAppUrl(request, "/dashboard?linkedin=connected"));
  } catch (error) {
    console.error("LinkedIn callback failed", {
      userId,
      redirectUri,
      error: toErrorLog(error),
    });
    return NextResponse.redirect(buildLocalAppUrl(request, "/dashboard?linkedin=error"));
  }
}
