import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { createUser } from '@/lib/db/users'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')

  if (code) {
    const response = NextResponse.redirect(new URL('/make-ebook', req.url))
    
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

      if (data.user) {
        try {
          const { user: existingUser } = await createUser({
            id: data.user.id,
            email: data.user.email!,
            username: data.user.user_metadata?.username || null,
          })
          console.log('User created/updated successfully')
        } catch (createError) {
          // Returning users will already have a row; ignore.
          console.log('User may already exist in database (normal for returning users)')
        }
      }

      return response
    } catch (error) {
      console.error('Auth callback error:', error)
      return NextResponse.redirect(new URL('/?error=auth_error', req.url))
    }
  }

  return NextResponse.redirect(new URL('/', req.url))
}