-- Migration: Add subscription fields to users table
-- Date: 2026-02-05
-- Purpose: Add fields for Stripe subscription management and user tier tracking

-- Add new subscription fields
ALTER TABLE "users"
ADD COLUMN IF NOT EXISTS "subscription_tier" text DEFAULT 'free' NOT NULL,
ADD COLUMN IF NOT EXISTS "is_grandfathered" boolean DEFAULT false NOT NULL,
ADD COLUMN IF NOT EXISTS "subscription_current_period_end" timestamp,
ADD COLUMN IF NOT EXISTS "stripe_price_id" text;

-- Create indexes for performance optimization on subscription queries
CREATE INDEX IF NOT EXISTS "idx_users_subscription_status" ON "users"("subscription_status");
CREATE INDEX IF NOT EXISTS "idx_users_subscription_tier" ON "users"("subscription_tier");
CREATE INDEX IF NOT EXISTS "idx_users_stripe_customer_id" ON "users"("stripe_customer_id");

-- Add comment for documentation
COMMENT ON COLUMN "users"."is_grandfathered" IS 'Users who had accounts before subscription launch - get lifetime Pro access';
COMMENT ON COLUMN "users"."subscription_tier" IS 'Current subscription tier: free or pro';
COMMENT ON COLUMN "users"."subscription_current_period_end" IS 'When the current subscription period ends (for renewals)';
COMMENT ON COLUMN "users"."stripe_price_id" IS 'Stripe Price ID for the subscription plan';
