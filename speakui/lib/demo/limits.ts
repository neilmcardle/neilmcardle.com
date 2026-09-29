export const DEMO = process.env.DEMO_MODE === "1";

export const VISITOR_EDITS = Number(process.env.DEMO_VISITOR_EDITS ?? 10);

const IP_PER_MINUTE = Number(process.env.DEMO_IP_PER_MINUTE ?? 20);

const MONTHLY_CALLS = Number(process.env.DEMO_MONTHLY_CALLS ?? 40_000);

export const COOKIE = "speakui_demo";

export type Verdict =
  | { ok: true }
  | { ok: false; reason: "visitor" | "ip" | "global"; message: string };

const ipHits = new Map<string, number[]>();
let globalCalls = 0;
let globalMonth = new Date().getUTCMonth();

function bumpGlobal(): number {
  const month = new Date().getUTCMonth();
  if (month !== globalMonth) {
    globalMonth = month;
    globalCalls = 0;
  }
  return ++globalCalls;
}

function ipAllowed(ip: string): boolean {
  const now = Date.now();
  const recent = (ipHits.get(ip) ?? []).filter((t) => now - t < 60_000);
  recent.push(now);
  ipHits.set(ip, recent);

  if (ipHits.size > 5_000)
    for (const [k, v] of ipHits)
      if (!v.some((t) => now - t < 60_000)) ipHits.delete(k);
  return recent.length <= IP_PER_MINUTE;
}

export function ipOf(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  return fwd?.split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown";
}

export function usedBy(req: Request): number {
  const raw = req.headers.get("cookie") ?? "";
  const match = raw.match(new RegExp(`${COOKIE}=(\\d+)`));
  return match ? Number(match[1]) : 0;
}

export function check(req: Request): Verdict {
  if (!DEMO) return { ok: true };

  if (usedBy(req) >= VISITOR_EDITS) {
    return {
      ok: false,
      reason: "visitor",
      message: `That's the ${VISITOR_EDITS} edits this demo allows. What you built is still on screen, and the decisions behind it are in the panel.`,
    };
  }
  if (!ipAllowed(ipOf(req))) {
    return {
      ok: false,
      reason: "ip",
      message: "Too many requests in a row. Give it a minute.",
    };
  }
  if (bumpGlobal() > MONTHLY_CALLS) {
    return {
      ok: false,
      reason: "global",
      message:
        "The demo has used its allowance for this month. The write-up and the video still show how it works.",
    };
  }
  return { ok: true };
}

export function spentCookie(used: number): string {
  const month = 60 * 60 * 24 * 30;
  return `${COOKIE}=${used + 1}; Path=/; Max-Age=${month}; SameSite=Lax`;
}
