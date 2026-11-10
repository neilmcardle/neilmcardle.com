export function safeNext(raw: string | null, origin: string): string {
  if (
    !raw ||
    !raw.startsWith("/") ||
    raw.startsWith("//") ||
    raw.includes("\\")
  )
    return "/coverly";
  const target = new URL(raw, origin);
  if (target.origin !== origin) return "/coverly";
  return target.pathname + target.search + target.hash;
}
