import Link from "next/link"
import { GlossyEmailRevealButton } from "@/components/GlossyEmailRevealButton"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        {/* Digital Business Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 backdrop-blur-lg border border-gray-200">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-black mb-2">Neil McArdle</h1>
            <p className="text-lg text-gray-600 font-medium">Designer.</p>
          </div>

          {/* Products */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-black mb-4 text-center">Products</h2>
            <div className="flex justify-center items-center space-x-4">
              <Link 
                href="/make-ebook/explore" 
                className="text-black hover:text-gray-600 transition-colors font-medium border-b border-black hover:border-gray-600"
              >
                makeEbook
              </Link>
              <span className="text-gray-400">|</span>
              <Link 
                href="https://vectorpaint.vercel.app/" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-black hover:text-gray-600 transition-colors font-medium border-b border-black hover:border-gray-600"
              >
                Vector Paint
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div className="mb-8">
            <GlossyEmailRevealButton className="w-full" />
          </div>

          {/* Read my mind */}
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-3">Read my mind</p>
            <Link 
              href="https://www.betterthings.design/" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-black hover:text-gray-600 transition-colors font-medium border-b border-black hover:border-gray-600 text-sm"
            >
              Looking for my design agency?
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}