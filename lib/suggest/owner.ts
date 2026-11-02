import { cookies } from "next/headers";

export const OWNER_COOKIE = "nm-suggest-owner";
export const OWNER_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(input),
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function ownerToken(): Promise<string | null> {
  const password = process.env.SUGGEST_OWNER_PASSWORD;
  const secret = process.env.SUGGEST_COOKIE_SECRET;
  if (!password || !secret) return null;
  return sha256Hex(`${password}:${secret}`);
}

export function passwordMatches(submitted: string): boolean {
  const expected = process.env.SUGGEST_OWNER_PASSWORD;
  if (!expected || submitted.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ submitted.charCodeAt(i);
  }
  return diff === 0;
}

export async function isOwner(): Promise<boolean> {
  const expected = await ownerToken();
  if (!expected) return false;
  const value = (await cookies()).get(OWNER_COOKIE)?.value;
  return value === expected;
}
