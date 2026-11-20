import "dotenv/config";
import { db } from "../lib/db";
import { users } from "../lib/db/schema";
import { eq } from "drizzle-orm";

const FREE_EMAIL = process.env.FREE_TEST_EMAIL ?? "";

async function setupTestAccounts() {
  console.log("Setting up test accounts...\n");

  try {
    console.log("Setting up neil@neilmcardle.com as Pro (grandfathered)...");

    const proUser = await db
      .select()
      .from(users)
      .where(eq(users.email, "neil@neilmcardle.com"))
      .limit(1);

    if (proUser.length === 0) {
      console.log("⚠️  User neil@neilmcardle.com not found in database.");
      console.log(
        "   Sign up with this email first, then run this script again.\n",
      );
    } else {
      await db
        .update(users)
        .set({
          subscriptionTier: "pro",
          subscriptionStatus: "active",
          isGrandfathered: true,
          updatedAt: new Date(),
        })
        .where(eq(users.email, "neil@neilmcardle.com"));

      console.log("✓ neil@neilmcardle.com set as Pro (grandfathered)\n");
    }

    console.log("Checking the free test account...");

    const freeUser = await db
      .select()
      .from(users)
      .where(eq(users.email, FREE_EMAIL))
      .limit(1);

    if (freeUser.length === 0) {
      console.log(
        "⚠️  Free test account not found. Set FREE_TEST_EMAIL in .env.local.",
      );
      console.log(
        "   Sign up with this email to create free tier test account.\n",
      );
    } else {
      console.log("✓ Free test account exists (free tier)\n");

      if (freeUser[0].subscriptionTier !== "free") {
        await db
          .update(users)
          .set({
            subscriptionTier: "free",
            subscriptionStatus: null,
            isGrandfathered: false,
            updatedAt: new Date(),
          })
          .where(eq(users.email, FREE_EMAIL));

        console.log("  Reset to free tier\n");
      }
    }

    console.log("Test accounts setup complete!");
    console.log("\nTest with:");
    console.log("  Pro:  neil@neilmcardle.com");
    console.log("  Free: the FREE_TEST_EMAIL account");
  } catch (error) {
    console.error("Error setting up test accounts:", error);
    process.exit(1);
  }

  process.exit(0);
}

setupTestAccounts();
