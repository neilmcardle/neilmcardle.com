import { createClient } from "@supabase/supabase-js";

export function createCoverlyPublicClient() {
  const url = process.env.NEXT_PUBLIC_COVERLY_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_COVERLY_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}
