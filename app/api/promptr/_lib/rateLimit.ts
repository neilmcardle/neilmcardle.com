import { clientIp, hit, waitPhrase } from "@/lib/rateLimit";

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const MAX_REQUESTS_PER_HOUR = 10;
const DAILY_LIMIT = 300;

export interface RateLimitResult {
  allowed: boolean;
  message?: string;
  retryAfterSeconds?: number;
}

export async function checkPromptrRateLimit(
  ip: string,
): Promise<RateLimitResult> {
  const mine = await hit(`promptr:ip:${ip}`, MAX_REQUESTS_PER_HOUR, HOUR);
  if (!mine.allowed) {
    return {
      allowed: false,
      message: `You've hit the rate limit for Promptr. Try again in ${waitPhrase(mine.retryAfterSeconds)}.`,
      retryAfterSeconds: mine.retryAfterSeconds,
    };
  }

  const everyone = await hit("promptr:day", DAILY_LIMIT, DAY);
  if (!everyone.allowed) {
    return {
      allowed: false,
      message: "Promptr has hit its daily request cap. Try again tomorrow.",
      retryAfterSeconds: everyone.retryAfterSeconds,
    };
  }

  return { allowed: true };
}

export const getClientIp = clientIp;
