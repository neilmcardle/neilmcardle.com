import { cookies } from "next/headers";

export const OWNER_COOKIE = "nm-suggest-owner";
export const OWNER_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

const encoder = new TextEncoder();

async function hmacHex(key: string, message: string): Promise<string> {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    encoder.encode(message),
  );
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function sameText(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function settings() {
  const password = process.env.SUGGEST_OWNER_PASSWORD;
  const secret = process.env.SUGGEST_COOKIE_SECRET;
  if (!password || !secret) return null;
  const version = process.env.SUGGEST_SESSION_VERSION || "1";
  return { password, secret, version };
}

async function signature(issuedAt: string): Promise<string | null> {
  const s = settings();
  if (!s) return null;
  return hmacHex(s.secret, `${issuedAt}:${s.version}:${s.password}`);
}

export async function ownerToken(): Promise<string | null> {
  const issuedAt = String(Math.floor(Date.now() / 1000));
  const sig = await signature(issuedAt);
  return sig ? `${issuedAt}.${sig}` : null;
}

export async function passwordMatches(submitted: string): Promise<boolean> {
  const s = settings();
  if (!s) return false;
  const [given, expected] = await Promise.all([
    hmacHex(s.secret, `password:${submitted}`),
    hmacHex(s.secret, `password:${s.password}`),
  ]);
  return sameText(given, expected);
}

export async function isOwner(): Promise<boolean> {
  const value = (await cookies()).get(OWNER_COOKIE)?.value;
  if (!value) return false;
  const [issuedAt, sig] = value.split(".");
  if (!issuedAt || !sig || !/^\d+$/.test(issuedAt)) return false;
  const age = Math.floor(Date.now() / 1000) - Number(issuedAt);
  if (age < 0 || age > OWNER_COOKIE_MAX_AGE) return false;
  const expected = await signature(issuedAt);
  return expected !== null && sameText(sig, expected);
}
