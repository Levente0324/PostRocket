import { decryptSecret, encryptSecret } from "@/lib/crypto";

export type StoredAccountMeta = {
  pageId?: string;
  igUserId?: string;
};

export function encodeAccountMeta(meta: StoredAccountMeta) {
  return JSON.stringify(meta);
}

export function decodeAccountMeta(value: string | null) {
  if (!value) return {} as StoredAccountMeta;

  try {
    const parsed = JSON.parse(value) as StoredAccountMeta;
    return parsed ?? {};
  } catch {
    return {} as StoredAccountMeta;
  }
}

export function encryptAccessToken(token: string) {
  return encryptSecret(token);
}

export function decryptAccessToken(value: string) {
  return decryptSecret(value);
}

export function parseStoredImages(imageUrl: string | null) {
  if (!imageUrl) return [] as string[];

  const trimmed = imageUrl.trim();
  if (!trimmed) return [] as string[];

  if (trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.filter((item): item is string => typeof item === "string" && !!item);
      }
      return [];
    } catch {
      return [];
    }
  }

  if (trimmed.includes(",")) {
    return trimmed
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);
  }

  return [trimmed];
}
