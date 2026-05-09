import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_WEPRAY_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_WEPRAY_SUPABASE_ANON_KEY!

let browserClient: SupabaseClient | undefined

export function getWeprayBrowserClient(): SupabaseClient {
  if (!browserClient) {
    if (process.env.NODE_ENV !== 'production') {
      const globalClient = (globalThis as any).__wepray_supabase_browser_client
      if (globalClient) {
        browserClient = globalClient
      } else {
        browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey)
        ;(globalThis as any).__wepray_supabase_browser_client = browserClient
      }
    } else {
      browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey)
    }
  }
  return browserClient!
}
