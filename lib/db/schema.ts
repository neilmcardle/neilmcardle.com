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
  blurb: text('blurb'),
  coverUrl: text('cover_url'),
  publisher: text('publisher'),
  pubDate: text('pub_date'),
  isbn: text('isbn'),
  language: text('language'),
  genre: text('genre'),
  chapters: json('chapters').$type<Array<{
    id: string
    title: string
    content: string
    type: 'frontmatter' | 'content' | 'backmatter'
  }>>().notNull().default([]),
  tags: json('tags').$type<string[]>().default([]),
  endnotes: json('endnotes').$type<Array<{
    id: string
    number: number
    content: string
    sourceChapterId: string
    sourceText: string
  }>>().default([]),
  endnoteReferences: json('endnote_references').$type<Array<{
    id: string
    number: number
    chapterId: string
    endnoteId: string
  }>>().default([]),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type EBook = typeof ebooks.$inferSelect
export type NewEBook = typeof ebooks.$inferInsert