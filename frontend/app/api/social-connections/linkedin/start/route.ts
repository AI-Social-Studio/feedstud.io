import { auth } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { backendJson } from "@/lib/backend-api-client";

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  const redirectUri = new URL("/api/social-connections/linkedin/callback", request.url).toString();

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
      error,
    });
    return NextResponse.redirect(new URL("/dashboard?linkedin=error", request.url));
  }
}
