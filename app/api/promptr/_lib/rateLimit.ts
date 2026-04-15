// Shared in-memory rate limiter for Promptr.
//
// Lifted from app/api/generate-typography/route.ts, generalised so that
// the two Promptr routes (score and refine) share a single bucket per IP
// and one global daily counter. This means a user's combined usage
// across both endpoints counts against one limit — a refine costs the
// same as a score, which matches expectations and keeps the rules easy
// to explain in the UI error message.
//
// Storage is in-memory, resets on every Vercel cold start. That's
// acceptable for a hobby-tier portfolio piece: the downside of a reset
// is that abusers get another window, but so does everyone else, and
// nothing persists between requests that's worth protecting. If the
// tool takes off and the resets become exploitable, move to Upstash
// Redis behind the same interface — no call sites need to change.

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;   // 1 hour rolling window per IP
const MAX_REQUESTS_PER_WINDOW = 10;            // combined score + refine per IP per hour
const DAILY_LIMIT = 300;                        // global, across all users, per day

type IpRecord = { count: number; resetTime: number };

const rateLimitStore = new Map<string, IpRecord>();
let dailyCount = 0;
let dailyResetTime = Date.now() + 24 * 60 * 60 * 1000;

export interface RateLimitResult {
  allowed: boolean;
  message?: string;
  retryAfterSeconds?: number;
}

export function checkPromptrRateLimit(ip: string): RateLimitResult {
  const now = Date.now();

  // Daily window roll-over
  if (now > dailyResetTime) {
    dailyCount = 0;
    dailyResetTime = now + 24 * 60 * 60 * 1000;
  }

  // Global daily ceiling — protects infrastructure from a single bad
  // actor or a viral moment spinning up a surprise bill.
  if (dailyCount >= DAILY_LIMIT) {
    return {
      allowed: false,
      message: "Promptr has hit its daily request cap. Try again tomorrow.",
      retryAfterSeconds: Math.ceil((dailyResetTime - now) / 1000),
    };
  }

  // Per-IP hourly window
  const record = rateLimitStore.get(ip);
  if (record) {
    if (now > record.resetTime) {
      rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    } else if (record.count >= MAX_REQUESTS_PER_WINDOW) {
      const minutesLeft = Math.max(1, Math.ceil((record.resetTime - now) / 60000));
      return {
        allowed: false,
        message: `You've hit the rate limit for Promptr. Try again in ${minutesLeft} ${minutesLeft === 1 ? "minute" : "minutes"}.`,
        retryAfterSeconds: Math.ceil((record.resetTime - now) / 1000),
      };
    } else {
      record.count++;
    }
  } else {
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
  }

  dailyCount++;
  return { allowed: true };
}

// Pull the caller's IP out of a Next.js request. Vercel sets
// `x-forwarded-for` with a comma-separated list; the first entry is
// the original client. Falls back to 'unknown' which effectively
// collapses all unresolvable callers into one bucket — fine for the
// hobby-tier threat model.
export function getClientIp(req: Request): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
}
