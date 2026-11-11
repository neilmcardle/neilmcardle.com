import {
  pgTable,
  text,
  timestamp,
  uuid,
  boolean,
  integer,
  jsonb,
  index,
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
  aiQuestionUsedAt: timestamp("ai_question_used_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const makeebookBooks = pgTable(
  "makeebook_books",
  {
    id: uuid("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    data: jsonb("data").notNull(),
    revision: integer("revision").default(0).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [index("makeebook_books_user_id_idx").on(table.userId)],
);

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
      | "pending"
      | "paid"
      | "submitted"
      | "dry_run"
      | "failed"
      | "unconfirmed"
      | "refunded"
      | "expired"
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

export const suggestions = pgTable("suggestions", {
  id: uuid("id").defaultRandom().primaryKey(),
  request: text("request").notNull(),
  status: text("status")
    .$type<"new" | "building" | "ready" | "live" | "rejected" | "failed">()
    .default("new")
    .notNull(),
  prUrl: text("pr_url"),
  costMicroUsd: integer("cost_micro_usd").default(0).notNull(),
  note: text("note"),
  buildStartedAt: timestamp("build_started_at"),
  liveAt: timestamp("live_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type MakeebookBook = typeof makeebookBooks.$inferSelect;
export type NewMakeebookBook = typeof makeebookBooks.$inferInsert;
export type SparkWaitlistEntry = typeof sparkWaitlist.$inferSelect;
export type NewSparkWaitlistEntry = typeof sparkWaitlist.$inferInsert;
export type CoverlyWaitlistEntry = typeof coverlyWaitlist.$inferSelect;
export type NewCoverlyWaitlistEntry = typeof coverlyWaitlist.$inferInsert;
export type VectorPaintOrder = typeof vectorPaintOrders.$inferSelect;
export type Suggestion = typeof suggestions.$inferSelect;
