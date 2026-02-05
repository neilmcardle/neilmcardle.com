import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { sql } from 'drizzle-orm'

const DATABASE_URL = process.env.DATABASE_URL!

async function addSubscriptionColumns() {
  console.log('Connecting to database...')
  const client = postgres(DATABASE_URL)
  const db = drizzle(client)

  try {
    console.log('Adding subscription columns to users table...')

    await db.execute(sql`
      ALTER TABLE users
        ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
        ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
        ADD COLUMN IF NOT EXISTS subscription_status TEXT,
        ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free' NOT NULL,
        ADD COLUMN IF NOT EXISTS is_grandfathered BOOLEAN DEFAULT false NOT NULL,
        ADD COLUMN IF NOT EXISTS subscription_current_period_end TIMESTAMP,
        ADD COLUMN IF NOT EXISTS stripe_price_id TEXT
    `)

    console.log('✓ Subscription columns added successfully')

    console.log('Updating existing users to have explicit "free" tier...')
    await db.execute(sql`
      UPDATE users
      SET subscription_tier = 'free'
      WHERE subscription_tier IS NULL
    `)

    console.log('✓ Migration completed successfully!')
  } catch (error) {
    console.error('Error running migration:', error)
    process.exit(1)
  } finally {
    await client.end()
  }
}

addSubscriptionColumns()
