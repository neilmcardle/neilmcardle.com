import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";

export async function createCoverlyUserClient() {
  const url = process.env.NEXT_PUBLIC_COVERLY_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_COVERLY_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  const cookieStore = await cookies();
  return createServerClient(url, key, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Called from a Server Component: session refresh is handled by the browser client.
        }
      },
    },
  });
}

export function createCoverlyServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_COVERLY_SUPABASE_URL;
  const key = process.env.COVERLY_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}
