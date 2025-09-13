import { NextRequest, NextResponse } from 'next/server'
import { createUser, getUserById } from '@/lib/db/users'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

// Helper function to create authenticated Supabase client
function createSupabaseClient(req: NextRequest, res: NextResponse) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          res.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          res.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )
}

// Helper function to verify authentication
async function verifyAuth(supabase: any, userId?: string) {
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return { authenticated: false, user: null, error: 'Unauthorized' }
  }

  // If a specific user ID is provided, ensure the authenticated user matches
  if (userId && user.id !== userId) {
    return { authenticated: false, user: null, error: 'Access denied: User ID mismatch' }
  }

  return { authenticated: true, user, error: null }
}

export async function POST(req: NextRequest) {
  const response = NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  const supabase = createSupabaseClient(req, response)

  try {
    const { id, email, username } = await req.json()
    
    // Verify authentication
    const auth = await verifyAuth(supabase, id)
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 }, { headers: response.headers })
    }

    if (!id || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 }, { headers: response.headers })
    }

    // Only allow users to create their own user record
    if (auth.user!.id !== id) {
      return NextResponse.json({ error: 'Access denied: Cannot create user record for another user' }, { status: 403 }, { headers: response.headers })
    }

    // Create user in database
    const { user, error } = await createUser({ id, email, username })
    
    if (error) {
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 }, { headers: response.headers })
    }

    return NextResponse.json({ user }, { status: 200, headers: response.headers })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 }, { headers: response.headers })
  }
}

export async function GET(req: NextRequest) {
  const response = NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  const supabase = createSupabaseClient(req, response)

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Missing user ID' }, { status: 400 }, { headers: response.headers })
    }

    // Verify authentication
    const auth = await verifyAuth(supabase, id)
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 }, { headers: response.headers })
    }

    const { user, error } = await getUserById(id)
    
    if (error) {
      return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 }, { headers: response.headers })
    }

    return NextResponse.json({ user }, { status: 200, headers: response.headers })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 }, { headers: response.headers })
  }
}