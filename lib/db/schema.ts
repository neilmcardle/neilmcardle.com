import { pgTable, text, timestamp, json, uuid, boolean } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  username: text('username'),
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  subscriptionStatus: text('subscription_status').$type<'active' | 'canceled' | 'past_due' | 'incomplete'>(),
  subscriptionTier: text('subscription_tier').$type<'free' | 'pro'>().default('free').notNull(),
  isGrandfathered: boolean('is_grandfathered').default(false).notNull(),
  subscriptionCurrentPeriodEnd: timestamp('subscription_current_period_end'),
  stripePriceId: text('stripe_price_id'),
  hasLifetimeAccess: boolean('has_lifetime_access').default(false).notNull(),
  lifetimePaymentId: text('lifetime_payment_id'),
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

export type PrototypeProjectStatus = 'draft' | 'review' | 'shared' | 'archived'
export type PrototypeVersionStatus = 'draft' | 'published'

export interface PrototypeFileMap {
  [path: string]: string
}

export const prototypeProjects = pgTable('prototype_projects', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  templateKey: text('template_key').notNull().default('blank-next'),
  framework: text('framework').notNull().default('nextjs-react'),
  status: text('status').$type<PrototypeProjectStatus>().notNull().default('draft'),
  previewUrl: text('preview_url'),
  deploymentUrl: text('deployment_url'),
  latestVersionId: uuid('latest_version_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const prototypeVersions = pgTable('prototype_versions', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').notNull().references(() => prototypeProjects.id, { onDelete: 'cascade' }),
  createdByUserId: uuid('created_by_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  label: text('label').notNull(),
  prompt: text('prompt'),
  status: text('status').$type<PrototypeVersionStatus>().notNull().default('draft'),
  files: json('files').$type<PrototypeFileMap>().notNull().default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const prototypeComments = pgTable('prototype_comments', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').notNull().references(() => prototypeProjects.id, { onDelete: 'cascade' }),
  authorUserId: uuid('author_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  targetPath: text('target_path'),
  targetNode: text('target_node'),
  body: text('body').notNull(),
  resolved: boolean('resolved').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type EBook = typeof ebooks.$inferSelect
export type NewEBook = typeof ebooks.$inferInsert
export type PrototypeProject = typeof prototypeProjects.$inferSelect
export type NewPrototypeProject = typeof prototypeProjects.$inferInsert
export type PrototypeVersion = typeof prototypeVersions.$inferSelect
export type NewPrototypeVersion = typeof prototypeVersions.$inferInsert
export type PrototypeComment = typeof prototypeComments.$inferSelect
export type NewPrototypeComment = typeof prototypeComments.$inferInsert
