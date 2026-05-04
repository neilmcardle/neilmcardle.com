import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { createUser, getUserById } from '@/lib/db/users'

// Cookies set on the redirect response have to be carried across when we
// rebuild that response with a different URL. exchangeCodeForSession writes
// the session cookies through the supabase client onto the original
// response, and we need those cookies on whichever response we ultimately
// return.
function cloneResponseWithUrl(source: NextResponse, url: URL): NextResponse {
  const next = NextResponse.redirect(url)
  source.cookies.getAll().forEach((cookie) => {
    next.cookies.set(cookie)
  })
  return next
}

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

      let isNewSignup = false

      if (data.user) {
        // Pre-check: only treat this as a new signup if the row didn't
        // exist before we touched it. Inferring newness from createUser's
        // return value is unreliable because it swallows duplicate-key
        // errors and real DB errors into the same null result.
        const { user: priorRow } = await getUserById(data.user.id)
        isNewSignup = priorRow === null

        try {
          await createUser({
            id: data.user.id,
            email: data.user.email!,
            username: data.user.user_metadata?.username || null,
          })
          console.log('User created/updated successfully')
        } catch {
          // Returning users will already have a row; ignore.
          console.log('User may already exist in database (normal for returning users)')
        }
      }

      if (isNewSignup) {
        // Append ?signup=success so useSignupConversion fires the Google
        // Ads conversion event exactly once on landing.
        const target = new URL('/make-ebook', req.url)
        target.searchParams.set('signup', 'success')
        return cloneResponseWithUrl(response, target)
      }

      return response
    } catch (error) {
      console.error('Auth callback error:', error)
      return NextResponse.redirect(new URL('/?error=auth_error', req.url))
    }
  }

  return NextResponse.redirect(new URL('/', req.url))
}