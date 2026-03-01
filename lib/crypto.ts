import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "crypto";

const PREFIX = "enc:v1:";

function getKey() {
  const secret = process.env.META_TOKEN_ENCRYPTION_KEY;
  if (!secret) {
    throw new Error(
      "META_TOKEN_ENCRYPTION_KEY environment variable is required.",
    );
  }

  return createHash("sha256").update(secret).digest();
}

export function encryptSecret(plainText: string) {
  const iv = randomBytes(12);
  const key = getKey();
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plainText, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return `${PREFIX}${iv.toString("base64url")}:${encrypted.toString("base64url")}:${tag.toString("base64url")}`;
}

export function decryptSecret(value: string) {
  if (!value.startsWith(PREFIX)) {
    throw new Error("Token is not encrypted — expected enc:v1: prefix.");
  }

  const parts = value.slice(PREFIX.length).split(":");
  if (parts.length !== 3) {
    throw new Error("Encrypted secret is malformed.");
  }

  const [ivEncoded, encryptedEncoded, tagEncoded] = parts;
  const iv = Buffer.from(ivEncoded, "base64url");
  const encrypted = Buffer.from(encryptedEncoded, "base64url");
  const tag = Buffer.from(tagEncoded, "base64url");

  const key = getKey();
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);

  const plain = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return plain.toString("utf8");
}
