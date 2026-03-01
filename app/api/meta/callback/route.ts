import { encodeAccountMeta, encryptAccessToken } from "@/lib/social-account";
import { getMetaConfig, metaGet } from "@/lib/meta";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

type TokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
};

type MetaPage = {
  id: string;
  name: string;
  access_token: string;
  instagram_business_account?: {
    id: string;
    username?: string;
  };
};

type PagesResponse = {
  data: MetaPage[];
};

type MeResponse = {
  id: string;
};

function redirectWithStateClear(path: string, requestUrl: string) {
  const response = NextResponse.redirect(new URL(path, requestUrl));
  response.cookies.delete("meta_oauth_state");
  return response;
}

async function exchangeCodeForToken(code: string, redirectUri: string) {
  const { appId, appSecret } = getMetaConfig();

  const shortToken = await metaGet<TokenResponse>("/oauth/access_token", {
    client_id: appId,
    redirect_uri: redirectUri,
    client_secret: appSecret,
    code,
  });

  const longToken = await metaGet<TokenResponse>("/oauth/access_token", {
    grant_type: "fb_exchange_token",
    client_id: appId,
    client_secret: appSecret,
    fb_exchange_token: shortToken.access_token,
  });

  return longToken;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieStore = await cookies();
  const storedState = cookieStore.get("meta_oauth_state")?.value;

  if (!code || !state || !storedState || state !== storedState) {
    return redirectWithStateClear(
      "/dashboard/account-billing?meta_error=oauth_state",
      request.url,
    );
  }

  const provider = state.split(":")[0];
  if (provider !== "facebook" && provider !== "instagram") {
    return redirectWithStateClear(
      "/dashboard/account-billing?meta_error=invalid_provider",
      request.url,
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirectWithStateClear("/login", request.url);
  }

  try {
    const { appUrl } = getMetaConfig();
    const redirectUri = `${appUrl}/api/meta/callback`;
    const token = await exchangeCodeForToken(code, redirectUri);

    // Validate the token response before using it
    if (!token.access_token || typeof token.access_token !== "string") {
      throw new Error("Meta API returned an invalid access token.");
    }

    const me = await metaGet<MeResponse>("/me", {
      access_token: token.access_token,
      fields: "id",
    });
    // expires_in may be absent from some OAuth flows — default to 60 days
    const expiresInSeconds =
      typeof token.expires_in === "number" && token.expires_in > 0
        ? token.expires_in
        : 60 * 24 * 60 * 60;
    const tokenExpiresAt = new Date(
      Date.now() + expiresInSeconds * 1000,
    ).toISOString();

    const pages = await metaGet<PagesResponse>("/me/accounts", {
      access_token: token.access_token,
      fields: "id,name,access_token,instagram_business_account{id,username}",
    });

    if (!pages.data || !Array.isArray(pages.data) || pages.data.length === 0) {
      return redirectWithStateClear(
        "/dashboard/account-billing?meta_error=no_pages",
        request.url,
      );
    }

    const { error: deleteExistingError } = await supabase
      .from("social_accounts")
      .delete()
      .eq("user_id", user.id)
      .eq("provider", provider);

    if (deleteExistingError) {
      throw new Error(`Failed to replace existing ${provider} account.`);
    }

    if (provider === "facebook") {
      const page = pages.data[0];

      if (!page.access_token || typeof page.access_token !== "string") {
        throw new Error("Facebook page did not return a valid access token.");
      }

      const { error: insertFacebookError } = await supabase
        .from("social_accounts")
        .insert({
          user_id: user.id,
          provider: "facebook",
          access_token: encryptAccessToken(page.access_token),
          meta_user_id: me.id,
          meta_page_id: page.id,
          refresh_token: encodeAccountMeta({ pageId: page.id }),
          expires_at: tokenExpiresAt,
          account_name: page.name,
        });

      if (insertFacebookError) {
        throw new Error("Failed to save Facebook connection.");
      }
    }

    if (provider === "instagram") {
      const page = pages.data.find((item) => !!item.instagram_business_account);

      if (!page?.instagram_business_account?.id) {
        return redirectWithStateClear(
          "/dashboard/account-billing?meta_error=no_instagram_business",
          request.url,
        );
      }

      if (!page.access_token || typeof page.access_token !== "string") {
        throw new Error("Instagram page did not return a valid access token.");
      }

      const { error: insertInstagramError } = await supabase
        .from("social_accounts")
        .insert({
          user_id: user.id,
          provider: "instagram",
          access_token: encryptAccessToken(page.access_token),
          meta_user_id: me.id,
          meta_page_id: page.id,
          instagram_account_id: page.instagram_business_account.id,
          refresh_token: encodeAccountMeta({
            igUserId: page.instagram_business_account.id,
            pageId: page.id,
          }),
          expires_at: tokenExpiresAt,
          account_name: page.instagram_business_account.username || page.name,
        });

      if (insertInstagramError) {
        throw new Error("Failed to save Instagram connection.");
      }
    }

    return redirectWithStateClear(
      "/dashboard/account-billing?meta=connected",
      request.url,
    );
  } catch (error) {
    console.error("Meta OAuth callback error:", error);
    return redirectWithStateClear(
      "/dashboard/account-billing?meta_error=oauth_failed",
      request.url,
    );
  }
}
