-- Migration: Add Vector Paint orders table
-- Date: 2026-09-25
-- Purpose: Record every canvas order from checkout to Gelato so failed fulfilment can be found and retried

CREATE TABLE IF NOT EXISTS "vector_paint_orders" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "status" text DEFAULT 'pending' NOT NULL,
  "product_id" text NOT NULL,
  "quantity" integer NOT NULL,
  "unit_price_minor" integer NOT NULL,
  "currency" text NOT NULL,
  "stripe_session_id" text,
  "email" text,
  "print_path" text,
  "preview_path" text,
  "gelato_order_id" text,
  "error" text,
  "paid_at" timestamp,
  "submitted_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "vector_paint_orders_stripe_session_id_unique" UNIQUE("stripe_session_id")
);

CREATE INDEX IF NOT EXISTS "vector_paint_orders_status_idx" ON "vector_paint_orders" ("status");

ALTER TABLE "vector_paint_orders" ENABLE ROW LEVEL SECURITY;
