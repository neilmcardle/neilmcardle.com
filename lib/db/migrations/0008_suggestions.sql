CREATE TABLE IF NOT EXISTS "suggestions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "request" text NOT NULL,
  "status" text DEFAULT 'new' NOT NULL,
  "pr_url" text,
  "cost_micro_usd" integer DEFAULT 0 NOT NULL,
  "note" text,
  "build_started_at" timestamp,
  "live_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "suggestions_status_idx" ON "suggestions" ("status");

ALTER TABLE "suggestions" ENABLE ROW LEVEL SECURITY;
