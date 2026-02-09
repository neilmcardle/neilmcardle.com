# Stripe Setup Guide for Make eBook

This guide walks you through setting up Stripe for the Make eBook product with two pricing tiers:
- **Pro**: $9/month (recurring subscription)
- **Lifetime**: $149 (one-time payment)

## Step 1: Create Stripe Account & Products

1. Go to [stripe.com](https://stripe.com) and create/login to your account
2. Navigate to **Dashboard → Products**

### Create Pro Product (Subscription)
- Click **Add Product**
- Name: `Make eBook Pro`
- Description: `Monthly subscription with cloud sync and AI features`
- Type: `Recurring`
- Billing period: `Monthly`
- Price: `$9.00`
- Copy the **Price ID** (starts with `price_`)

### Create Lifetime Product (One-time)
- Click **Add Product**
- Name: `Make eBook Lifetime`
- Description: `One-time lifetime access to all Pro features`
- Type: `One-time`
- Price: `$149.00`
- Copy the **Price ID** (starts with `price_`)

## Step 2: Get Stripe Credentials

1. Go to **Dashboard → Developers → API Keys**
2. Copy your **Secret Key** (live or test key)
3. Copy your **Publishable Key** (live or test key)

## Step 3: Create Webhook Endpoint

1. Go to **Dashboard → Developers → Webhooks**
2. Click **Add endpoint**
3. Endpoint URL: `https://yourdomain.com/api/webhooks/stripe`
4. Events to select:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the **Signing Secret** (starts with `whsec_`)

## Step 4: Set Environment Variables

Add these to your `.env.local`:

```bash
# Stripe Keys
STRIPE_SECRET_KEY=sk_live_xxxx  # or sk_test_xxxx for testing
STRIPE_PUBLISHABLE_KEY=pk_live_xxxx  # or pk_test_xxxx for testing

# Price IDs from Step 1
STRIPE_PRO_PRICE_ID=price_xxxx  # $9/month subscription
STRIPE_LIFETIME_PRICE_ID=price_xxxx  # $149 one-time

# Webhook Secret
STRIPE_WEBHOOK_SECRET=whsec_xxxx

# Your app URL for redirect URLs
NEXT_PUBLIC_APP_URL=https://yourdomain.com  # or http://localhost:3000 for dev
```

## Step 5: Run Database Migration

Run the migration to add lifetime access columns:

```bash
npm run db:push  # or your migration command
# Then run:
tsx scripts/add-lifetime-columns.ts
```

## Step 6: Test Stripe Integration (Development)

1. Use [Stripe test cards](https://stripe.com/docs/testing#cards):
   - Visa: `4242 4242 4242 4242`
   - Card requires authentication: `4000 0025 0000 3155`

2. Test subscription $9/month:
   - Go to your app → Upgrade Modal → "Upgrade to Pro - $9/month"

3. Test lifetime $149:
   - Go to your app → Pricing section → "Buy Now" button (on Lifetime plan)
   - Or call the `/api/checkout-lifetime` endpoint

## Step 7: Verify Webhooks (Development)

Use Stripe CLI for local webhook testing:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Listen for events
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# View logs
stripe logs tail --live
```

## API Endpoints Created

- `/api/checkout` - Regular $9/month subscription checkout
- `/api/checkout-lifetime` - $149 lifetime purchase checkout
- `/api/customer-portal` - Manage existing subscriptions
- `/api/subscription` - Get current subscription status
- `/api/webhooks/stripe` - Webhook receiver for all Stripe events

## Fee Structure

Stripe takes a 2.9% + $0.30 fee per transaction.

For $9/month: Stripe fee ≈ $0.56 (6.2%)
For $149: Stripe fee ≈ $4.63 (3.1%)

## Testing Checklist

- [ ] Can subscribe to $9/month Pro plan
- [ ] Can purchase $149 Lifetime plan
- [ ] Webhook events are logged in Stripe Dashboard
- [ ] User subscription status updates after payment
- [ ] Can access Pro features after subscription
- [ ] Can access all features with lifetime purchase
- [ ] Can manage subscription in customer portal
- [ ] Webhook logs show successful event processing

## Production Checklist

- [ ] Switch to live Stripe keys
- [ ] Update all webhook endpoints to production URL
- [ ] Test with real payment methods
- [ ] Verify emails/notifications are sent
- [ ] Set up email notifications for failed payments
- [ ] Monitor Stripe dashboard for errors
- [ ] Have backup payment method ready

## Troubleshooting

### "Stripe not configured" error
- Make sure all required environment variables are set
- Check that keys don't have extra spaces

### "Invalid signature" on webhooks
- Verify webhook secret matches exactly
- Ensure request signature header is present

### User not found error
- Check that supabase_user_id metadata is in Stripe customer
- Verify database has correct user ID matching Supabase

### Payment succeeds but user not upgraded
- Check webhook logs in Stripe Dashboard
- Ensure database migration ran successfully
- Verify no errors in application logs

## Support

- [Stripe Docs](https://stripe.com/docs)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Next.js + Stripe Tutorial](https://stripe.com/docs/plugins/nextjs)
