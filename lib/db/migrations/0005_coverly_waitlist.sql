-- Migration: Add Coverly waitlist table
-- Date: 2026-08-24
-- Purpose: Capture email signups for the Coverly early-access page

CREATE TABLE IF NOT EXISTS "coverly_waitlist" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "email" text NOT NULL,
  "source" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "coverly_waitlist_email_unique" UNIQUE("email")
);
