"use client"

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-[#1a1a1a] border-t border-gray-200 dark:border-gray-700 mt-auto transition-colors">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col items-center space-y-4">
          {/* Legal Links */}
          <div className="flex space-x-8">
            <Link href="/terms" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors text-sm">
              Terms of Service
            </Link>
            <Link href="/privacy" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors text-sm">
              Privacy Policy
            </Link>
          </div>
          <div className="text-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              © 2026 Neil McArdle. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}