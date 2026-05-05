-- Migration: Add Spark waitlist table
-- Date: 2026-05-05
-- Purpose: Capture email signups for the Spark coming-soon page

CREATE TABLE IF NOT EXISTS "spark_waitlist" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "email" text NOT NULL,
  "source" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "spark_waitlist_email_unique" UNIQUE("email")
);
