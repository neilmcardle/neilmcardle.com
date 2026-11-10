import { sql } from "drizzle-orm";

import { db } from "@/lib/db";

export interface LimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

const memory = new Map<string, { count: number; resetAt: number }>();
let warned = false;

function hitInMemory(
  key: string,
  limit: number,
  windowMs: number,
): LimitResult {
  const now = Date.now();
  const entry = memory.get(key);
  if (!entry || now >= entry.resetAt) {
    memory.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }
  entry.count++;
  return {
    allowed: entry.count <= limit,
    retryAfterSeconds: Math.ceil((entry.resetAt - now) / 1000),
  };
}

export async function hit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<LimitResult> {
  const resetAt = new Date(Date.now() + windowMs);
  try {
    const rows = await db.execute<{
      count: number;
      reset_at: Date | string;
    }>(sql`
      insert into rate_limits (key, count, reset_at)
      values (${key}, 1, ${resetAt})
      on conflict (key) do update set
        count = case when rate_limits.reset_at <= now() then 1 else rate_limits.count + 1 end,
        reset_at = case when rate_limits.reset_at <= now() then excluded.reset_at else rate_limits.reset_at end
      returning count, reset_at
    `);
    const row = rows[0];
    if (Math.random() < 0.01) {
      void db
        .execute(
          sql`delete from rate_limits where reset_at < now() - interval '1 day'`,
        )
        .catch(() => {});
    }
    const count = Number(row?.count ?? 1);
    const ends = new Date(row?.reset_at ?? resetAt).getTime();
    return {
      allowed: count <= limit,
      retryAfterSeconds: Math.max(1, Math.ceil((ends - Date.now()) / 1000)),
    };
  } catch (err) {
    if (!warned) {
      warned = true;
      console.error(
        "[rate limit] database limiter unavailable, using memory",
        err,
      );
    }
    return hitInMemory(key, limit, windowMs);
  }
}

export function clientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return req.headers.get("x-real-ip") || "unknown";
}

export function waitPhrase(seconds: number): string {
  if (seconds < 90) return "a minute";
  const minutes = Math.ceil(seconds / 60);
  if (minutes < 60) return `${minutes} minutes`;
  const hours = Math.ceil(minutes / 60);
  return hours === 1 ? "an hour" : `${hours} hours`;
}
