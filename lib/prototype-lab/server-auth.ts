import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { getUserByEmail, getUserById } from '@/lib/db/users'

export async function requirePrototypeLabUser(req: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(_name: string, _value: string, _options: CookieOptions) {},
        remove(_name: string, _options: CookieOptions) {},
      },
    }
  )

  const {
    data: { user: authUser },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !authUser) {
    return {
      error: NextResponse.json(
        { error: 'Authentication required to use Prototype Lab.' },
        { status: 401 }
      ),
    }
  }

  let { user: dbUser } = await getUserById(authUser.id)

  if (!dbUser && authUser.email) {
    const { user: fallbackUser } = await getUserByEmail(authUser.email)
    dbUser = fallbackUser ?? null
  }

  if (!dbUser) {
    return {
      error: NextResponse.json(
        { error: 'No internal user record found for this account.' },
        { status: 403 }
      ),
    }
  }

  return {
    authUser,
    dbUser,
  }
}
