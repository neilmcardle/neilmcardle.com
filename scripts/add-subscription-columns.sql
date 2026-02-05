-- Add subscription columns to existing users table
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS subscription_status TEXT,
  ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free' NOT NULL,
  ADD COLUMN IF NOT EXISTS is_grandfathered BOOLEAN DEFAULT false NOT NULL,
  ADD COLUMN IF NOT EXISTS subscription_current_period_end TIMESTAMP,
  ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;

-- Update existing users to have explicit 'free' tier
UPDATE users
SET subscription_tier = 'free'
WHERE subscription_tier IS NULL;
