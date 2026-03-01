export const META_GRAPH_BASE = "https://graph.facebook.com/v23.0";

/** Timeout for all Meta Graph API calls — prevents hung requests from locking up the server. */
const META_FETCH_TIMEOUT_MS = 15_000;

function required(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} environment variable is required.`);
  }
  return value;
}

export function getMetaConfig() {
  return {
    appId: required("META_APP_ID"),
    appSecret: required("META_APP_SECRET"),
    appUrl: required("APP_URL"),
  };
}

/** Wraps fetch with an AbortController timeout so hung Meta API calls don't block indefinitely. */
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), META_FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } catch (err: any) {
    if (err?.name === "AbortError") {
      throw new Error("Meta API request timed out after 15 seconds.");
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export async function metaGet<T>(path: string, params: Record<string, string>) {
  const url = new URL(`${META_GRAPH_BASE}${path}`);
  Object.entries(params).forEach(([key, value]) =>
    url.searchParams.set(key, value),
  );

  const response = await fetchWithTimeout(url.toString(), { method: "GET" });
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.error?.message || "Meta API request failed.");
  }

  return payload as T;
}

export async function metaPost<T>(
  path: string,
  params: Record<string, string>,
) {
  const body = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => body.set(key, value));

  const response = await fetchWithTimeout(`${META_GRAPH_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.error?.message || "Meta API request failed.");
  }

  return payload as T;
}
