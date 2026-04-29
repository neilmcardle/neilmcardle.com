// Shared in-memory rate limiter; both score/refine routes share the same
// per-IP bucket and a global daily ceiling. Resets on cold start.

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 10;
const DAILY_LIMIT = 300;

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

  if (now > dailyResetTime) {
    dailyCount = 0;
    dailyResetTime = now + 24 * 60 * 60 * 1000;
  }

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
