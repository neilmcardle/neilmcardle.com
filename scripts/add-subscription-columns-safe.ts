import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { sql } from 'drizzle-orm'

const DATABASE_URL = process.env.DATABASE_URL!

async function addSubscriptionColumnsSafe() {
  console.log('Connecting to database...')
  const client = postgres(DATABASE_URL)
  const db = drizzle(client)

  try {
    console.log('\n1. Creating users table if it doesn\'t exist...')
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT NOT NULL UNIQUE,
        username TEXT,
        stripe_customer_id TEXT,
        stripe_subscription_id TEXT,
        subscription_status TEXT,
        subscription_tier TEXT DEFAULT 'free' NOT NULL,
        is_grandfathered BOOLEAN DEFAULT false NOT NULL,
        subscription_current_period_end TIMESTAMP,
        stripe_price_id TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `)
    console.log('✓ Users table ready')

    console.log('\n2. Creating ebooks table if it doesn\'t exist...')
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS ebooks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        description TEXT,
        cover_image TEXT,
        chapters JSONB DEFAULT '[]'::jsonb NOT NULL,
        tags JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `)
    console.log('✓ Ebooks table ready')

    console.log('\n3. Ensuring all users have subscription_tier set...')
    await db.execute(sql`
      UPDATE users
      SET subscription_tier = 'free'
      WHERE subscription_tier IS NULL OR subscription_tier = ''
    `)
    console.log('✓ All users have subscription tier')

    console.log('\n✅ Migration completed successfully!')
    console.log('\nNext steps:')
    console.log('1. Run: npm run test:accounts')
    console.log('2. Restart your dev server')
    console.log('3. Test the subscription badge in the sidebar')
  } catch (error) {
    console.error('❌ Error running migration:', error)
    process.exit(1)
  } finally {
    await client.end()
  }
}

addSubscriptionColumnsSafe()
