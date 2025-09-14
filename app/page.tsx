import Link from "next/link"
import { SecureEmailLink } from "@/components/SecureEmailLink"

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <div className="space-y-12">
          {/* Header */}
          <div>
            <h1 className="text-6xl font-bold text-black mb-4">Neil McArdle</h1>
            <p className="text-2xl text-gray-600">Designer.</p>
          </div>

          {/* Products */}
          <div>
            <h2 className="text-2xl font-semibold text-black mb-6">Products</h2>
            <div className="space-y-4">
              <Link 
                href="/make-ebook/explore" 
                className="inline-block text-lg text-black hover:text-gray-600 transition-colors underline"
              >
                makeEbook
              </Link>
              <span className="mx-4 text-gray-400">|</span>
              <Link 
                href="https://vectorpaint.vercel.app/" 
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-lg text-black hover:text-gray-600 transition-colors underline"
              >
                Vector Paint
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h2 className="text-2xl font-semibold text-black mb-6">Contact</h2>
            <SecureEmailLink />
          </div>

          {/* Read my mind */}
          <div>
            <h2 className="text-2xl font-semibold text-black mb-6">Read my mind</h2>
            <Link 
              href="https://www.betterthings.design/" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-lg text-black hover:text-gray-600 transition-colors underline"
            >
              Looking for my design agency?
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}