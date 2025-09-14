import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Singleton browser client to prevent multiple GoTrueClient instances
let browserClient: SupabaseClient | undefined

export function getSupabaseBrowserClient() {
  if (!browserClient) {
    // In development, store on globalThis to survive HMR
    if (process.env.NODE_ENV !== 'production') {
      const globalClient = (globalThis as any).__supabase_browser_client
      if (globalClient) {
        browserClient = globalClient
      } else {
        browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey)
        ;(globalThis as any).__supabase_browser_client = browserClient
      }
    } else {
      browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey)
    }
  }
  return browserClient
}