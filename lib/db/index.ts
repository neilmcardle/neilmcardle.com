import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

const connectionString = process.env.DATABASE_URL!

// Prefetch disabled: not supported in transaction pool mode.
const client = postgres(connectionString, { prepare: false })
export const db = drizzle(client, { schema })

export * from './schema'