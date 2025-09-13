"use client"

import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">makeEbook</h3>
            <p className="text-gray-600 text-sm">
              Create professional eBooks with ease. Build your collection and share your stories.
            </p>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/terms" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Contact</h3>
            <p className="text-gray-600 text-sm">
              Built by{' '}
              <Link 
                href="https://neilmcardle.com" 
                className="text-gray-900 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Neil McArdle
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 text-center">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} makeEbook. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}