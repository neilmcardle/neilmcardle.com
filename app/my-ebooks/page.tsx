"use client"

import { useState, useEffect } from 'react'
import { Header } from '@/components/Header'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Download, Edit, Trash2, Plus } from 'lucide-react'
import Link from 'next/link'

const BOOK_LIBRARY_KEY = "makeebook_library"

interface SavedBook {
  id: string
  title: string
  author: string
  description: string
  savedAt: number
  chapters: Array<{ title: string; content: string }>
}

function loadBookLibrary(): SavedBook[] {
  if (typeof window === "undefined") return []
  const str = localStorage.getItem(BOOK_LIBRARY_KEY)
  if (str) {
    try {
      return JSON.parse(str)
    } catch (e) {
      console.error('Error loading book library:', e)
    }
  }
  return []
}

function removeBookFromLibrary(id: string) {
  let library = loadBookLibrary()
  library = library.filter((b) => b.id !== id)
  localStorage.setItem(BOOK_LIBRARY_KEY, JSON.stringify(library))
}

function MyEbooksContent() {
  const [books, setBooks] = useState<SavedBook[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedBooks = loadBookLibrary()
    setBooks(savedBooks)
    setLoading(false)
  }, [])

  const handleDeleteBook = (id: string) => {
    if (confirm('Are you sure you want to delete this eBook? This action cannot be undone.')) {
      removeBookFromLibrary(id)
      setBooks(books.filter(book => book.id !== id))
    }
  }

  const getWordCount = (book: SavedBook) => {
    const totalContent = book.chapters.map(ch => ch.content).join(' ')
    const plainText = totalContent.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    return plainText.split(' ').length
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf9f5] dark:bg-[#0a0a0a]">
        <Header />
        <div className="pt-20 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#141413] dark:border-white mx-auto mb-4"></div>
            <p className="text-[#141413]/60 dark:text-gray-400">Loading your eBooks...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#faf9f5] dark:bg-[#0a0a0a]">
      <Header />
      
      <main className="pt-20 pb-12">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-[#141413] dark:text-white mb-2">My eBooks</h1>
                <p className="text-[#141413]/60 dark:text-gray-400">
                  {books.length === 0 
                    ? "You haven't created any eBooks yet." 
                    : `${books.length} ${books.length === 1 ? 'eBook' : 'eBooks'} saved locally`
                  }
                </p>
              </div>
              <Link href="/make-ebook">
                <Button className="bg-[#141413] hover:bg-[#141413]/80 text-[#faf9f5]">
                  <Plus className="w-4 h-4 mr-2" />
                  Create New eBook
                </Button>
              </Link>
            </div>
          </div>

          {/* Books Grid */}
          {books.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="w-16 h-16 text-[#dedddd] dark:text-gray-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-[#141413] dark:text-white mb-2">No eBooks yet</h2>
              <p className="text-[#141413]/60 dark:text-gray-400 mb-6 max-w-md mx-auto">
                Get started by creating your first eBook. Share your stories, knowledge, or ideas with the world.
              </p>
              <Link href="/make-ebook">
                <Button className="bg-[#141413] hover:bg-[#141413]/80 text-[#faf9f5]">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First eBook
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {books.map((book) => (
                <Card key={book.id} className="hover:shadow-lg transition-shadow relative group">
                  <Link href={`/make-ebook?load=${book.id}`} className="block">
                    <CardHeader>
                      <CardTitle className="line-clamp-2">
                        {book.title || 'Untitled eBook'}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        by {book.author || 'Unknown Author'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {book.description && (
                          <p className="text-sm text-[#141413]/60 dark:text-gray-400 line-clamp-3">
                            {book.description}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between text-xs text-[#141413]/50 dark:text-gray-500">
                          <span>{book.chapters.length} chapters</span>
                          <span>{getWordCount(book).toLocaleString()} words</span>
                        </div>
                        
                        <div className="text-xs text-[#141413]/50 dark:text-gray-500">
                          Saved {formatDate(book.savedAt)}
                        </div>
                      </div>
                    </CardContent>
                  </Link>
                  
                  {/* Delete button positioned absolutely */}
                  <div className="absolute top-4 right-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleDeleteBook(book.id)
                      }}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default function MyEbooksPage() {
  return (
    <ProtectedRoute>
      <MyEbooksContent />
    </ProtectedRoute>
  )
}