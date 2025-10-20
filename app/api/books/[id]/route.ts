import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { CookieOptions } from '@supabase/ssr'
import { db } from '@/lib/db'
import { ebooks } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export async function GET(
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

    const [book] = await db
      .select()
      .from(ebooks)
      .where(and(eq(ebooks.id, params.id), eq(ebooks.userId, user.id)))
    
    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 })
    }
    
    return NextResponse.json({ book }, { headers: response.headers })
  } catch (error: any) {
    console.error('Error fetching book:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch book' },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { title, author, blurb, coverUrl, chapters, tags, publisher, pubDate, isbn, language, genre, endnotes, endnoteReferences } = body

    const updateData: any = { updatedAt: new Date() }
    if (title !== undefined) updateData.title = title
    if (author !== undefined) updateData.author = author
    if (blurb !== undefined) updateData.blurb = blurb
    if (coverUrl !== undefined) updateData.coverUrl = coverUrl
    if (chapters !== undefined) updateData.chapters = chapters
    if (tags !== undefined) updateData.tags = tags
    if (publisher !== undefined) updateData.publisher = publisher
    if (pubDate !== undefined) updateData.pubDate = pubDate
    if (isbn !== undefined) updateData.isbn = isbn
    if (language !== undefined) updateData.language = language
    if (genre !== undefined) updateData.genre = genre
    if (endnotes !== undefined) updateData.endnotes = endnotes
    if (endnoteReferences !== undefined) updateData.endnoteReferences = endnoteReferences

    const [book] = await db
      .update(ebooks)
      .set(updateData)
      .where(and(eq(ebooks.id, params.id), eq(ebooks.userId, user.id)))
      .returning()
    
    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 })
    }
    
    return NextResponse.json({ book }, { headers: response.headers })
  } catch (error: any) {
    console.error('Error updating book:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update book' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const response = NextResponse.json({ success: false })
    
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

    const [deletedBook] = await db
      .delete(ebooks)
      .where(and(eq(ebooks.id, params.id), eq(ebooks.userId, user.id)))
      .returning()
    
    if (!deletedBook) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 })
    }
    
    return NextResponse.json({ success: true }, { headers: response.headers })
  } catch (error: any) {
    console.error('Error deleting book:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete book' },
      { status: 500 }
    )
  }
}
