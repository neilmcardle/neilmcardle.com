import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { CookieOptions } from '@supabase/ssr'
import { db } from '@/lib/db'
import { ebooks } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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

    const [originalBook] = await db
      .select()
      .from(ebooks)
      .where(and(eq(ebooks.id, params.id), eq(ebooks.userId, user.id)))
    
    if (!originalBook) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 })
    }

    const [duplicatedBook] = await db.insert(ebooks).values({
      userId: user.id,
      title: `${originalBook.title} (Copy)`,
      author: originalBook.author,
      description: originalBook.description,
      coverImage: originalBook.coverImage,
      chapters: originalBook.chapters,
      tags: originalBook.tags,
      publisher: originalBook.publisher,
      pubDate: originalBook.pubDate,
      isbn: originalBook.isbn,
      language: originalBook.language,
      genre: originalBook.genre,
    }).returning()
    
    return NextResponse.json({ book: duplicatedBook }, { status: 201, headers: response.headers })
  } catch (error: any) {
    console.error('Error duplicating book:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to duplicate book' },
      { status: 500 }
    )
  }
}
