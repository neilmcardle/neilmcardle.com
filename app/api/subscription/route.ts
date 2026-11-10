import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { CookieOptions } from "@supabase/ssr";
import { getUserById, getUserByEmail } from "@/lib/db/users";
import { devProEmails, isProUser } from "@/lib/billing/proStatus";

export async function GET(req: NextRequest) {
  try {
    const response = NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return req.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            response.cookies.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            response.cookies.set({ name, value: "", ...options });
          },
        },
      },
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: response.headers },
      );
    }

    let { user: dbUser } = await getUserById(user.id);

    if (!dbUser && user.email) {
      const { user: fallbackUser } = await getUserByEmail(user.email);
      if (fallbackUser) {
        console.warn(
          `[subscription] id lookup failed but email lookup succeeded for ${user.email}. ` +
            `auth.id=${user.id}, public.users.id=${fallbackUser.id}. ` +
            `Fix with: UPDATE public.users SET id = '${user.id}' WHERE email = '${user.email}';`,
        );
        dbUser = fallbackUser;
      }
    }

    if (!dbUser && process.env.NODE_ENV === "development") {
      if (user.email && devProEmails().includes(user.email.toLowerCase())) {
        console.warn(
          `[subscription] dev override: granting Pro (DB unreachable)`,
        );
        return NextResponse.json(
          {
            tier: "pro",
            status: "active",
            isGrandfathered: true,
            currentPeriodEnd: null,
            stripeCustomerId: null,
            isPro: true,
          },
          { status: 200, headers: response.headers },
        );
      }
    }

    if (!dbUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404, headers: response.headers },
      );
    }

    const tier: "free" | "pro" = isProUser(dbUser) ? "pro" : "free";

    return NextResponse.json(
      {
        tier,
        status: dbUser.subscriptionStatus,
        isGrandfathered: dbUser.isGrandfathered,
        currentPeriodEnd: dbUser.subscriptionCurrentPeriodEnd,
        stripeCustomerId: dbUser.stripeCustomerId,
        isPro: tier === "pro",
      },
      { status: 200, headers: response.headers },
    );
  } catch (error: any) {
    console.error("Error fetching subscription data:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch subscription data" },
      { status: 500 },
    );
  }
}
