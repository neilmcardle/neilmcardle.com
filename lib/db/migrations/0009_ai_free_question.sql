ALTER TABLE "users"
ADD COLUMN IF NOT EXISTS "ai_question_used_at" timestamp;
