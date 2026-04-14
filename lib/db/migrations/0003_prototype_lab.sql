-- Migration: Add Prototype Lab tables
-- Date: 2026-04-14
-- Purpose: Support internal coded prototype projects, version snapshots, and review comments

CREATE TABLE IF NOT EXISTS "prototype_projects" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "name" text NOT NULL,
  "slug" text NOT NULL,
  "description" text,
  "template_key" text DEFAULT 'blank-next' NOT NULL,
  "framework" text DEFAULT 'nextjs-react' NOT NULL,
  "status" text DEFAULT 'draft' NOT NULL,
  "preview_url" text,
  "deployment_url" text,
  "latest_version_id" uuid,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "prototype_projects_slug_unique" UNIQUE("slug"),
  CONSTRAINT "prototype_projects_user_id_users_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade
);

CREATE TABLE IF NOT EXISTS "prototype_versions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "project_id" uuid NOT NULL,
  "created_by_user_id" uuid NOT NULL,
  "label" text NOT NULL,
  "prompt" text,
  "status" text DEFAULT 'draft' NOT NULL,
  "files" json DEFAULT '{}'::json NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "prototype_versions_project_id_prototype_projects_id_fk"
    FOREIGN KEY ("project_id") REFERENCES "public"."prototype_projects"("id") ON DELETE cascade,
  CONSTRAINT "prototype_versions_created_by_user_id_users_id_fk"
    FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE cascade
);

CREATE TABLE IF NOT EXISTS "prototype_comments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "project_id" uuid NOT NULL,
  "author_user_id" uuid NOT NULL,
  "target_path" text,
  "target_node" text,
  "body" text NOT NULL,
  "resolved" boolean DEFAULT false NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "prototype_comments_project_id_prototype_projects_id_fk"
    FOREIGN KEY ("project_id") REFERENCES "public"."prototype_projects"("id") ON DELETE cascade,
  CONSTRAINT "prototype_comments_author_user_id_users_id_fk"
    FOREIGN KEY ("author_user_id") REFERENCES "public"."users"("id") ON DELETE cascade
);

CREATE INDEX IF NOT EXISTS "idx_prototype_projects_user_id" ON "prototype_projects"("user_id");
CREATE INDEX IF NOT EXISTS "idx_prototype_projects_status" ON "prototype_projects"("status");
CREATE INDEX IF NOT EXISTS "idx_prototype_versions_project_id" ON "prototype_versions"("project_id");
CREATE INDEX IF NOT EXISTS "idx_prototype_comments_project_id" ON "prototype_comments"("project_id");

COMMENT ON TABLE "prototype_projects" IS 'Internal coded prototype workspaces';
COMMENT ON TABLE "prototype_versions" IS 'Version snapshots of prototype file maps';
COMMENT ON TABLE "prototype_comments" IS 'Review comments attached to prototype projects';
