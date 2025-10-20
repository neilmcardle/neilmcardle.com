import { pgTable, text, timestamp, json, uuid, integer } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  username: text('username'),
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  subscriptionStatus: text('subscription_status').$type<'active' | 'canceled' | 'past_due' | 'incomplete'>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const ebooks = pgTable('ebooks', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  author: text('author').notNull(),
  description: text('description'),
  coverImage: text('cover_image'),
  chapters: json('chapters').$type<Array<{
    id: string
    title: string
    content: string
    order: number
    type: 'frontmatter' | 'content' | 'backmatter'
  }>>().notNull().default([]),
  tags: json('tags').$type<string[]>().default([]),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type EBook = typeof ebooks.$inferSelect
export type NewEBook = typeof ebooks.$inferInsert