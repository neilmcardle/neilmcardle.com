"use client"

import Link from "next/link"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-deep-black text-white py-16 border-t border-gold/10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <div className="flex items-center mb-6">
              <div className="relative h-8 w-8 mr-3">
                {/* Square outline logo - updated to be transparent inside */}
                <svg
                  viewBox="0 0 73.68 73.68"
                  className="h-full w-full text-gold"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                >
                  <rect x="4" y="4" width="65.68" height="65.68" />
                </svg>
              </div>

              <div className="flex flex-col">
                {/* Static logo text - no hover effects */}
                <div className="text-xl font-medium tracking-wider">
                  <span className="text-white">BETTER</span>
                  <span className="text-gold">THINGS</span>
                </div>
              </div>
            </div>
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              Crafting exquisite brand identities for discerning luxury and heritage brands. Elevating your presence
              with timeless elegance and distinctive design.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-medium mb-6">Navigation</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/" className="text-white/60 hover:text-gold transition-colors duration-300 text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-white/60 hover:text-gold transition-colors duration-300 text-sm">
                  About
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-white/60 hover:text-gold transition-colors duration-300 text-sm">
                  Services
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-white/60 hover:text-gold transition-colors duration-300 text-sm">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-medium mb-6">Contact</h3>
            <ul className="space-y-4">
              <li className="text-white/60 text-sm">London, United Kingdom</li>
              <li>
                <a
                  href="mailto:hello@betterthings.design"
                  className="text-white/60 hover:text-gold transition-colors duration-300 text-sm"
                >
                  hello@betterthings.design
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="relative my-12">
          <div className="h-px w-full bg-gradient-to-r from-gold/30 via-gold to-gold/30"></div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-white/40 text-xs mb-4 md:mb-0">
            © {currentYear} BetterThings.design. All rights reserved.
          </p>
          {/* Privacy Policy and Terms of Service text completely removed */}
        </div>
      </div>
    </footer>
  )
}
