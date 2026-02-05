-- Manual test accounts setup SQL script
-- Run this in your Supabase SQL Editor

-- Step 1: Insert both users into public.users table (using their auth.users IDs)
INSERT INTO public.users (id, email, subscription_tier, is_grandfathered, subscription_status, created_at, updated_at)
SELECT
  id,
  email,
  'free' as subscription_tier,
  false as is_grandfathered,
  null as subscription_status,
  now() as created_at,
  now() as updated_at
FROM auth.users
WHERE email IN ('neil@neilmcardle.com', 'neilmcardlemail@gmail.com')
ON CONFLICT (id) DO NOTHING;

-- Step 2: Update neil@neilmcardle.com to Pro (grandfathered)
UPDATE public.users
SET
  subscription_tier = 'pro',
  subscription_status = 'active',
  is_grandfathered = true,
  updated_at = now()
WHERE email = 'neil@neilmcardle.com';

-- Step 3: Verify the setup
SELECT
  email,
  subscription_tier,
  is_grandfathered,
  subscription_status
FROM public.users
WHERE email IN ('neil@neilmcardle.com', 'neilmcardlemail@gmail.com')
ORDER BY email;
