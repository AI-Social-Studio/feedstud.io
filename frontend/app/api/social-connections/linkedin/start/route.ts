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

  const redirectUri = buildLinkedInCallbackUrl(request);

  try {
    const params = new URLSearchParams({ redirect_uri: redirectUri });
    const response = await backendJson<{ authorization_url: string }>(
      `/social-connections/linkedin/start?${params.toString()}`,
      {
        headers: { "X-Actor-Id": userId },
      },
    );
    return NextResponse.redirect(response.authorization_url);
  } catch (error) {
    console.error("LinkedIn start failed", {
      userId,
      redirectUri,
      error: toErrorLog(error),
    });
    return NextResponse.redirect(buildLocalAppUrl(request, "/dashboard?linkedin=error"));
  }
}
