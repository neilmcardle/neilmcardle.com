/**
 * Script to set up test accounts for subscription testing
 *
 * Run with: npx tsx scripts/setup-test-accounts.ts
 */

import 'dotenv/config';
import { db } from '../lib/db';
import { users } from '../lib/db/schema';
import { eq } from 'drizzle-orm';

async function setupTestAccounts() {
  console.log('Setting up test accounts...\n');

  try {
    // 1. Set neil@neilmcardle.com as Pro (grandfathered for testing)
    console.log('Setting up neil@neilmcardle.com as Pro (grandfathered)...');

    const proUser = await db
      .select()
      .from(users)
      .where(eq(users.email, 'neil@neilmcardle.com'))
      .limit(1);

    if (proUser.length === 0) {
      console.log('⚠️  User neil@neilmcardle.com not found in database.');
      console.log('   Sign up with this email first, then run this script again.\n');
    } else {
      await db
        .update(users)
        .set({
          subscriptionTier: 'pro',
          subscriptionStatus: 'active',
          isGrandfathered: true,
          updatedAt: new Date(),
        })
        .where(eq(users.email, 'neil@neilmcardle.com'));

      console.log('✓ neil@neilmcardle.com set as Pro (grandfathered)\n');
    }

    // 2. Check neilmcardlemail@gmail.com (should remain free)
    console.log('Checking neilmcardlemail@gmail.com...');

    const freeUser = await db
      .select()
      .from(users)
      .where(eq(users.email, 'neilmcardlemail@gmail.com'))
      .limit(1);

    if (freeUser.length === 0) {
      console.log('⚠️  User neilmcardlemail@gmail.com not found in database.');
      console.log('   Sign up with this email to create free tier test account.\n');
    } else {
      console.log('✓ neilmcardlemail@gmail.com exists (free tier)\n');

      // Ensure it's on free tier
      if (freeUser[0].subscriptionTier !== 'free') {
        await db
          .update(users)
          .set({
            subscriptionTier: 'free',
            subscriptionStatus: null,
            isGrandfathered: false,
            updatedAt: new Date(),
          })
          .where(eq(users.email, 'neilmcardlemail@gmail.com'));

        console.log('  Reset to free tier\n');
      }
    }

    console.log('Test accounts setup complete!');
    console.log('\nTest with:');
    console.log('  Pro:  neil@neilmcardle.com');
    console.log('  Free: neilmcardlemail@gmail.com');

  } catch (error) {
    console.error('Error setting up test accounts:', error);
    process.exit(1);
  }

  process.exit(0);
}

setupTestAccounts();
