"use client"

import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col items-center space-y-4">
          {/* Legal Links */}
          <div className="flex space-x-8">
            <Link href="/terms" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
              Terms of Service
            </Link>
            <Link href="/privacy" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
              Privacy Policy
            </Link>
          </div>

          <div className="text-center">
            <p className="text-gray-500 text-sm">
              © 2025 makeEbook. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}