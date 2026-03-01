import { getMetaConfig } from "@/lib/meta";
import { createClient } from "@/lib/supabase/server";
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

const SCOPES = [
  "pages_show_list",
  "pages_read_engagement",
  "pages_manage_posts",
  "instagram_basic",
  "instagram_content_publish",
  "business_management",
];

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const oneMinuteAgo = new Date(Date.now() - 60_000).toISOString();
  const { count: recentConnectAttempts } = await supabase
    .from("usage_logs")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("action", "meta_connect_attempt")
    .gte("created_at", oneMinuteAgo);

  if ((recentConnectAttempts ?? 0) > 10) {
    return NextResponse.redirect(
      new URL("/dashboard/account-billing?meta_error=rate_limited", request.url),
    );
  }

  await supabase.from("usage_logs").insert({
    user_id: user.id,
    action: "meta_connect_attempt",
  });

  const provider = new URL(request.url).searchParams.get("provider");
  if (provider !== "facebook" && provider !== "instagram") {
    return NextResponse.redirect(new URL("/dashboard/account-billing?meta_error=invalid_provider", request.url));
  }

  const { appId, appUrl } = getMetaConfig();
  const state = `${provider}:${randomUUID()}`;
  const redirectUri = `${appUrl}/api/meta/callback`;

  const authUrl = new URL("https://www.facebook.com/v23.0/dialog/oauth");
  authUrl.searchParams.set("client_id", appId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("scope", SCOPES.join(","));
  authUrl.searchParams.set("response_type", "code");

  const response = NextResponse.redirect(authUrl);
  response.cookies.set("meta_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 10,
    path: "/",
  });

  return response;
}
