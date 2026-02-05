-- Migration: Grandfather existing users
-- Date: 2026-02-05
-- Purpose: Grant lifetime Pro access to all users who signed up before subscription launch
--          This ensures existing users are rewarded for early adoption

-- Mark all existing users (created before current time) as grandfathered Pro users
-- These users get lifetime Pro access without requiring payment

UPDATE "users"
SET
  "subscription_tier" = 'pro',
  "is_grandfathered" = true,
  "subscription_status" = 'active',
  "updated_at" = NOW()
WHERE
  "created_at" < NOW()  -- All users created before this migration runs
  AND "is_grandfathered" = false  -- Only update once (idempotent)
  AND "subscription_tier" = 'free';  -- Only update users who haven't already been upgraded

-- Log the number of grandfathered users
-- Note: This returns the count but doesn't stop the migration if zero
DO $$
DECLARE
  user_count integer;
BEGIN
  SELECT COUNT(*) INTO user_count FROM "users" WHERE "is_grandfathered" = true;
  RAISE NOTICE 'Total grandfathered users: %', user_count;
END $$;
