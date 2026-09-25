import {
  pgTable,
  text,
  timestamp,
  json,
  uuid,
  boolean,
  integer,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  username: text("username"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  subscriptionStatus: text("subscription_status").$type<
    "active" | "trialing" | "canceled" | "past_due" | "incomplete"
  >(),
  subscriptionTier: text("subscription_tier")
    .$type<"free" | "pro">()
    .default("free")
    .notNull(),
  isGrandfathered: boolean("is_grandfathered").default(false).notNull(),
  subscriptionCurrentPeriodEnd: timestamp("subscription_current_period_end"),
  stripePriceId: text("stripe_price_id"),
  hasLifetimeAccess: boolean("has_lifetime_access").default(false).notNull(),
  lifetimePaymentId: text("lifetime_payment_id"),

  aiBriefUsedAt: timestamp("ai_brief_used_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const ebooks = pgTable("ebooks", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  author: text("author").notNull(),
  description: text("description"),
  coverImage: text("cover_image"),
  chapters: json("chapters")
    .$type<
      Array<{
        id: string;
        title: string;
        content: string;
        order: number;
        type: "frontmatter" | "content" | "backmatter";
      }>
    >()
    .notNull()
    .default([]),
  tags: json("tags").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const sparkWaitlist = pgTable("spark_waitlist", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  source: text("source"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const coverlyWaitlist = pgTable("coverly_waitlist", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  source: text("source"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const vectorPaintOrders = pgTable("vector_paint_orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  status: text("status")
    .$type<
      "pending" | "paid" | "submitted" | "dry_run" | "failed" | "expired"
    >()
    .default("pending")
    .notNull(),
  productId: text("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  unitPriceMinor: integer("unit_price_minor").notNull(),
  currency: text("currency").notNull(),
  stripeSessionId: text("stripe_session_id").unique(),
  email: text("email"),
  printPath: text("print_path"),
  previewPath: text("preview_path"),
  gelatoOrderId: text("gelato_order_id"),
  error: text("error"),
  paidAt: timestamp("paid_at"),
  submittedAt: timestamp("submitted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type EBook = typeof ebooks.$inferSelect;
export type NewEBook = typeof ebooks.$inferInsert;
export type SparkWaitlistEntry = typeof sparkWaitlist.$inferSelect;
export type NewSparkWaitlistEntry = typeof sparkWaitlist.$inferInsert;
export type CoverlyWaitlistEntry = typeof coverlyWaitlist.$inferSelect;
export type NewCoverlyWaitlistEntry = typeof coverlyWaitlist.$inferInsert;
export type VectorPaintOrder = typeof vectorPaintOrders.$inferSelect;
