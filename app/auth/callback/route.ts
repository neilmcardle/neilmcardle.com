import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { createUser } from '@/lib/db/users'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')

  if (code) {
    const response = NextResponse.redirect(new URL('/make-ebook', req.url))
    
    // Create Supabase client with cookie support
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return req.cookies.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            response.cookies.set({
              name,
              value,
              ...options,
            })
          },
          remove(name: string, options: CookieOptions) {
            response.cookies.set({
              name,
              value: '',
              ...options,
            })
          },
        },
      }
    )

    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Error exchanging code for session:', error)
        return NextResponse.redirect(new URL('/?error=auth_error', req.url))
      }

      // Securely create user in database on server-side after successful auth
      if (data.user) {
        try {
          const { user: existingUser } = await createUser({
            id: data.user.id,
            email: data.user.email!,
            username: data.user.user_metadata?.username || null,
          })
          console.log('User created/updated successfully')
        } catch (createError) {
          // If user already exists, ignore the error - this is expected for returning users
          console.log('User may already exist in database (normal for returning users)')
        }
      }

      return response
    } catch (error) {
      console.error('Auth callback error:', error)
      return NextResponse.redirect(new URL('/?error=auth_error', req.url))
    }
  }

  // If no code, redirect to home
  return NextResponse.redirect(new URL('/', req.url))
}