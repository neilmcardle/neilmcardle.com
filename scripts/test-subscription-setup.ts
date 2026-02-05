import 'dotenv/config';
import { db } from '../lib/db';
import { users } from '../lib/db/schema';
import { eq } from 'drizzle-orm';

async function testSetup() {
  console.log('🧪 Testing Subscription Setup\n');

  try {
    // 1. Test database connection
    console.log('1. Testing database connection...');
    const allUsers = await db.select().from(users);
    console.log(`✓ Connected! Found ${allUsers.length} users\n`);

    // 2. Check for test accounts
    console.log('2. Checking test accounts:');
    const testEmails = ['neil@neilmcardle.com', 'neilmcardlemail@gmail.com'];

    for (const email of testEmails) {
      const [user] = await db.select().from(users).where(eq(users.email, email));

      if (user) {
        console.log(`\n✓ ${email}`);
        console.log(`  - Tier: ${user.subscriptionTier}`);
        console.log(`  - Status: ${user.subscriptionStatus || 'none'}`);
        console.log(`  - Grandfathered: ${user.isGrandfathered}`);
        console.log(`  - ID: ${user.id}`);
      } else {
        console.log(`\n✗ ${email} - NOT FOUND`);
      }
    }

    console.log('\n3. Summary:');
    const proUsers = allUsers.filter(u => u.subscriptionTier === 'pro');
    const freeUsers = allUsers.filter(u => u.subscriptionTier === 'free');
    console.log(`  - Total users: ${allUsers.length}`);
    console.log(`  - Pro users: ${proUsers.length}`);
    console.log(`  - Free users: ${freeUsers.length}`);

    console.log('\n✅ All checks passed!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }

  process.exit(0);
}

testSetup();
