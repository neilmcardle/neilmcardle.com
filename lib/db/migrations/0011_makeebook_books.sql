CREATE TABLE IF NOT EXISTS "makeebook_books" (
  "id" uuid PRIMARY KEY NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "public"."users"("id") ON DELETE CASCADE,
  "data" jsonb NOT NULL,
  "revision" integer DEFAULT 0 NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL,
  "deleted_at" timestamptz
);

CREATE INDEX IF NOT EXISTS "makeebook_books_user_id_idx" ON "makeebook_books" ("user_id");

ALTER TABLE "makeebook_books" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "makeebook_books_select_own" ON "makeebook_books";
CREATE POLICY "makeebook_books_select_own" ON "makeebook_books"
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "makeebook_books_insert_own" ON "makeebook_books";
CREATE POLICY "makeebook_books_insert_own" ON "makeebook_books"
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "makeebook_books_update_own" ON "makeebook_books";
CREATE POLICY "makeebook_books_update_own" ON "makeebook_books"
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "makeebook_books_delete_own" ON "makeebook_books";
CREATE POLICY "makeebook_books_delete_own" ON "makeebook_books"
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
