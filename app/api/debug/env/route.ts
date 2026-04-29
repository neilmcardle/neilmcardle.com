import { NextResponse } from 'next/server'

// TODO: remove this debug endpoint.
export async function GET() {
  const isDev = process.env.NODE_ENV === 'development'
  const debugEnabled = process.env.ENABLE_DEBUG === 'true'

  if (!isDev && !debugEnabled) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'NOT SET',
    HAS_STRIPE_SECRET_KEY: !!process.env.STRIPE_SECRET_KEY,
    HAS_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    HAS_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  })
}
