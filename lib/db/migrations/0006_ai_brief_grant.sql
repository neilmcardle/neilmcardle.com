-- Migration: Add free monthly manuscript brief grant
-- Date: 2026-09-09
-- Purpose: Track when a non-Pro user last spent their one free manuscript
--          brief, so the grant can refresh monthly without an extra table.

ALTER TABLE "users"
ADD COLUMN IF NOT EXISTS "ai_brief_used_at" timestamp;

-- Claiming the grant is a single conditional UPDATE filtered on this column,
-- so it is on the hot path for every non-Pro brief request.
CREATE INDEX IF NOT EXISTS "idx_users_ai_brief_used_at" ON "users"("ai_brief_used_at");

COMMENT ON COLUMN "users"."ai_brief_used_at" IS 'When the user last spent their free monthly manuscript brief. NULL means never spent. Pro users bypass this entirely.';
