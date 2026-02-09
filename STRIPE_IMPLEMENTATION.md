# Stripe Implementation Summary

Your Make eBook app now has complete support for both $9/month subscriptions and $149 lifetime purchases.

## Changes Made

### 1. Database Schema (`lib/db/schema.ts`)
- Added `hasLifetimeAccess` (boolean) - tracks if user has made lifetime purchase
- Added `lifetimePaymentId` (string) - stores the Stripe payment ID for lifetime purchases

### 2. New Files Created

#### `/scripts/add-lifetime-columns.ts`
Migration script to add lifetime columns to your database.
**Run this first:** `tsx scripts/add-lifetime-columns.ts`

#### `/app/api/checkout-lifetime/route.ts`
New endpoint for handling $149 one-time lifetime purchases.
- Handles payment mode (not subscription)
- Creates Stripe checkout session with lifetime pricing

#### `STRIPE_SETUP.md`
Comprehensive guide for setting up Stripe with both pricing tiers.

### 3. Updated Files

#### `lib/db/users.ts`
- Updated `getUserSubscriptionTier()` to check for lifetime access
- Added `grantLifetimeAccess()` function to process lifetime purchases

#### `app/api/webhooks/stripe/route.ts`
- Added import for `grantLifetimeAccess`
- Added `checkout.session.completed` event handler
- Added `handleCheckoutSessionCompleted()` function to process lifetime payments

#### `app/make-ebook/components/UpgradeModal.tsx`
- Updated to show both pricing options ($9/month and $149 lifetime)
- Added plan selection toggle
- Enhanced UI with "BEST VALUE" badge for lifetime plan
- Intelligently routes to correct checkout endpoint

## Quick Start Checklist

### 1. Get Stripe Credentials
```bash
# Visit stripe.com → Dashboard → Developers → API Keys
# Copy your Secret Key and Publishable Key
```

### 2. Create Products in Stripe
```
Product 1: Make eBook Pro (Recurring)
- Monthly billing: $9.00 USD
- Copy the Price ID (price_xxx)

Product 2: Make eBook Lifetime (One-time)
- Price: $149.00 USD
- Copy the Price ID (price_xxx)
```

### 3. Set Environment Variables
```bash
# Add to .env.local
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_PRO_PRICE_ID=price_xxxxx  # $9/month
STRIPE_LIFETIME_PRICE_ID=price_xxxxx  # $149 one-time
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
NEXT_PUBLIC_APP_URL=https://yourdomain.com  # or http://localhost:3000
```

### 4. Run Database Migration
```bash
tsx scripts/add-lifetime-columns.ts
```

### 5. Set Up Webhooks
```
Endpoint: https://yourdomain.com/api/webhooks/stripe
Events to enable:
- customer.subscription.created
- customer.subscription.updated
- customer.subscription.deleted
- checkout.session.completed
- invoice.payment_succeeded
- invoice.payment_failed
```

### 6. Test with Stripe Test Card
```
Card: 4242 4242 4242 4242
Expiry: Any future date
CVC: Any 3 digits
```

## User Flows

### Subscription Flow ($9/month)
1. User clicks "Upgrade" or tries Pro feature
2. UpgradeModal shows with monthly selected by default
3. User clicks "Subscribe to Pro - $9/month"
4. Redirects to Stripe Checkout (subscription mode)
5. After payment, webhook updates database with subscription status
6. User gets immediate Pro access

### Lifetime Flow ($149)
1. User clicks "Upgrade" or tries Pro feature
2. UpgradeModal shows (user can select lifetime)
3. User clicks "Buy Lifetime - $149"
4. Redirects to Stripe Checkout (payment mode)
5. After payment, webhook grants lifetime access
6. User gets immediate Pro access forever

## Database Logic

Users get Pro status when:
- `isGrandfathered` = true (legacy), OR
- `hasLifetimeAccess` = true (lifetime purchase), OR
- `subscriptionStatus` = 'active' AND `subscriptionTier` = 'pro' (subscription)

## API Endpoints

```
POST /api/checkout
  → Creates subscription checkout session

POST /api/checkout-lifetime
  → Creates lifetime purchase checkout session

POST /api/webhooks/stripe
  → Receives all Stripe webhook events

POST /api/customer-portal
  → Allows subscription management (cancel, update payment)

GET /api/subscription
  → Returns user's subscription status
```

## Files Reference

- [Schema Definition](lib/db/schema.ts)
- [Database Functions](lib/db/users.ts)
- [Subscription Checkout](app/api/checkout/route.ts)
- [Lifetime Checkout](app/api/checkout-lifetime/route.ts)
- [Webhook Handler](app/api/webhooks/stripe/route.ts)
- [Upgrade Modal UI](app/make-ebook/components/UpgradeModal.tsx)
- [Stripe Setup Guide](STRIPE_SETUP.md)
- [Migration Script](scripts/add-lifetime-columns.ts)

## Stripe Testing

Use [Stripe CLI](https://stripe.com/docs/stripe-cli) for local development:

```bash
# Install
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhook events
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger test events
stripe trigger checkout.session.completed
```

## Next Steps

1. ✅ Schema created
2. ✅ Checkout endpoints ready
3. ✅ Webhook handler updated
4. ✅ UI component enhanced
5. TODO: Get Stripe API keys
6. TODO: Create Stripe products with prices
7. TODO: Add environment variables
8. TODO: Run database migration
9. TODO: Set up webhook endpoint in Stripe
10. TODO: Test with Stripe test cards

See [STRIPE_SETUP.md](STRIPE_SETUP.md) for detailed instructions.
