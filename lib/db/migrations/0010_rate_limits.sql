CREATE TABLE IF NOT EXISTS "rate_limits" (
  "key" text PRIMARY KEY NOT NULL,
  "count" integer NOT NULL,
  "reset_at" timestamptz NOT NULL
);

CREATE INDEX IF NOT EXISTS "rate_limits_reset_at_idx" ON "rate_limits" ("reset_at");

ALTER TABLE "rate_limits" ENABLE ROW LEVEL SECURITY;
