import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  if (!code) return NextResponse.redirect(new URL('/wepray', req.url))

  const response = NextResponse.redirect(new URL('/wepray/home', req.url))

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_WEPRAY_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_WEPRAY_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) {
    console.error('WePray auth callback error:', error)
    return NextResponse.redirect(new URL('/wepray?error=auth_error', req.url))
  }
  return response
}
