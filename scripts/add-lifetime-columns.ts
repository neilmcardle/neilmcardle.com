import 'dotenv/config'
import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import { sql } from 'drizzle-orm'

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL is not set')
}

async function addLifetimeColumns() {
  console.log('Connecting to database...')
  const client = postgres(DATABASE_URL)
  const db = drizzle(client)

  try {
    console.log('Adding lifetime columns to users table...')

    await client`
      ALTER TABLE users
        ADD COLUMN IF NOT EXISTS has_lifetime_access BOOLEAN DEFAULT false NOT NULL,
        ADD COLUMN IF NOT EXISTS lifetime_payment_id TEXT
    `

    console.log('✓ Lifetime columns added successfully')
    console.log('✓ Migration completed!')
  } catch (error) {
    console.error('Error during migration:', error)
    process.exit(1)
  } finally {
    await client.end()
  }
}

addLifetimeColumns()
