import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { CookieOptions } from '@supabase/ssr'
import { db } from '@/lib/db'
import { ebooks } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  try {
    const response = NextResponse.json({ books: [] })
    
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

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const books = await db.select().from(ebooks).where(eq(ebooks.userId, user.id))
    
    return NextResponse.json({ books }, { headers: response.headers })
  } catch (error: any) {
    console.error('Error fetching books:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch books' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const response = NextResponse.json({ book: null })
    
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

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, author, description, coverImage, chapters, tags, publisher, pubDate, isbn, language, genre } = body

    const [book] = await db.insert(ebooks).values({
      userId: user.id,
      title: title || 'Untitled Book',
      author: author || 'Unknown Author',
      description: description || '',
      coverImage: coverImage || null,
      chapters: chapters || [],
      tags: tags || [],
      publisher: publisher || null,
      pubDate: pubDate || null,
      isbn: isbn || null,
      language: language || null,
      genre: genre || null,
    }).returning()
    
    return NextResponse.json({ book }, { status: 201, headers: response.headers })
  } catch (error: any) {
    console.error('Error creating book:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create book' },
      { status: 500 }
    )
  }
}
