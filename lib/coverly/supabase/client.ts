"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let coverlyBrowserClient: SupabaseClient | undefined;

export function getCoverlyBrowserClient() {
  if (!coverlyBrowserClient) {
    if (process.env.NODE_ENV !== "production") {
      const globalScope = globalThis as typeof globalThis & {
        __coverly_browser_client?: SupabaseClient;
      };
      const globalClient = globalScope.__coverly_browser_client;
      if (globalClient) {
        coverlyBrowserClient = globalClient;
      } else {
        coverlyBrowserClient = createBrowserClient(
          process.env.NEXT_PUBLIC_COVERLY_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_COVERLY_SUPABASE_ANON_KEY!,
        );
        globalScope.__coverly_browser_client = coverlyBrowserClient;
      }
    } else {
      coverlyBrowserClient = createBrowserClient(
        process.env.NEXT_PUBLIC_COVERLY_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_COVERLY_SUPABASE_ANON_KEY!,
      );
    }
  }
  return coverlyBrowserClient;
}
