"use client"

import Link from 'next/link'
import { useAuth } from '@/lib/hooks/useAuth'
import { UserProfile } from './UserProfile'
import { MakeEbookIcon } from './MakeEbookIcon'
import { Plus, Library } from 'lucide-react'
import { Button } from './ui/button'

export function Header() {
  const { user } = useAuth()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* Back to Neil McArdle + Logo */}
        <div className="flex items-center gap-4">
          <Link href="https://neilmcardle.com">
            <Button variant="outline" size="sm" className="text-lg">
              ←
            </Button>
          </Link>
          <Link href="/make-ebook/explore" className="flex items-center gap-2 text-xl font-bold text-gray-900">
            <MakeEbookIcon className="w-6 h-6" />
            makeEbook
          </Link>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {user && (
            <>
              <Link 
                href="/make-ebook" 
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create eBook
              </Link>
              <Link 
                href="/my-ebooks" 
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Library className="w-4 h-4" />
                My eBooks
              </Link>
            </>
          )}
        </nav>

        {/* User Profile / Auth */}
        <div className="flex items-center gap-4">
          <UserProfile />
        </div>
      </div>
    </header>
  )
}