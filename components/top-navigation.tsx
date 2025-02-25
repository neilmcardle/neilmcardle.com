"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Home, User, Figma, Menu, X } from "lucide-react"

// Custom solid icons
const LinkedInSolid = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
)

const XSolid = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

const DribbbleSolid = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.372 0 0 5.373 0 12s5.372 12 12 12c6.627 0 12-5.373 12-12S18.627 0 12 0zm9.885 11.441c-2.575-.422-4.943-.445-7.103-.073-.244-.563-.497-1.125-.767-1.68 2.31-1 4.165-2.358 5.548-4.082 1.35 1.594 2.197 3.619 2.322 5.835zm-3.842-7.282c-1.205 1.554-2.868 2.783-4.986 3.68-1.016-1.861-2.178-3.676-3.488-5.438.779-.197 1.591-.314 2.431-.314 2.275 0 4.368.85 5.943 2.072zm-8.228-2.34C10.404 3.61 11.566 5.426 12.577 7.283c-2.813.918-6.199 1.121-10.161.613C3.18 4.9 5.625 2.674 8.615 1.82zm-7.46 10.12c4.432.575 8.371.424 11.817-.518.256.587.484 1.173.692 1.756-4.084 1.704-6.997 4.267-8.745 7.68C2.835 18.812 1.77 15.572 1.855 11.94zm2.555 9.27c1.552-3.209 4.178-5.608 7.926-7.197.737 1.91 1.321 3.885 1.745 5.916-.951.31-1.96.479-3.001.479-2.554 0-4.893-.988-6.67-2.598zm9.994 1.793c-.46-2.184-1.092-4.31-1.894-6.372 2.118-.445 4.125-.506 6.025-.198-.218 2.738-1.667 5.11-3.731 6.57z" />
  </svg>
)

const SubstackSolid = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z" />
  </svg>
)

export function TopNavigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="sticky top-4 z-50 mx-auto max-w-7xl px-4">
      <nav className="flex items-center rounded-full bg-white px-4 sm:px-6 py-4 shadow-lg relative">
        {/* Logo - always visible */}
        <Link href="/" className="mr-4 sm:mr-8">
          <Image src="/NMlogoBlack.svg" alt="NM Logo" width={32} height={32} priority />
        </Link>

        {/* Mobile menu button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="ml-auto p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200 rounded-full lg:hidden"
          aria-expanded={isMenuOpen}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-8 flex-1">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            <Home size={16} />
            Home
          </Link>
          <Link
            href="/about"
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            <User size={16} />
            About
          </Link>
          <Link
            href="https://www.figma.com/proto/zZcc3Li72GhWFVpv1PxC0O/%F0%9F%91%A8%F0%9F%8F%BC%E2%80%8D%F0%9F%9A%80--Neil-McArdle?page-id=7947%3A56485&node-id=7947-56486&viewport=119%2C809%2C0.29&t=9uLN4opTMa6jNFaW-1&scaling=min-zoom&content-scaling=fixed&starting-point-node-id=7947%3A56486"
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Figma size={16} />
            In-House
          </Link>
          <Link
            href="/better-things"
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/better-things-logo-ahIlYygaeLBNYlESsYFkMc5FydriL6.svg"
              alt="Better Things"
              width={16}
              height={16}
            />
            Freelance
          </Link>
        </div>

        {/* Desktop Social Links */}
        <div className="hidden lg:flex items-center gap-6">
          <Link
            href="https://www.linkedin.com/in/neilmcardle/"
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            <LinkedInSolid />
            <span className="sr-only">LinkedIn</span>
          </Link>
          <Link
            href="https://neilmcardle.substack.com"
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            <SubstackSolid />
            <span className="sr-only">Substack</span>
          </Link>
          <Link
            href="https://x.com/betterneil"
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            <XSolid />
            <span className="sr-only">X (Twitter)</span>
          </Link>
          <Link
            href="https://dribbble.com/neilmacdesign"
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            <DribbbleSolid />
            <span className="sr-only">Dribbble</span>
          </Link>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-white rounded-3xl shadow-lg lg:hidden">
            <div className="flex flex-col gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Home size={16} />
                Home
              </Link>
              <Link
                href="/about"
                className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <User size={16} />
                About
              </Link>
              <Link
                href="https://www.figma.com/proto/zZcc3Li72GhWFVpv1PxC0O/%F0%9F%91%A8%F0%9F%8F%BC%E2%80%8D%F0%9F%9A%80--Neil-McArdle?page-id=7947%3A56485&node-id=7947-56486&viewport=119%2C809%2C0.29&t=9uLN4opTMa6jNFaW-1&scaling=min-zoom&content-scaling=fixed&starting-point-node-id=7947%3A56486"
                className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsMenuOpen(false)}
              >
                <Figma size={16} />
                In-House
              </Link>
              <Link
                href="/better-things"
                className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/better-things-logo-ahIlYygaeLBNYlESsYFkMc5FydriL6.svg"
                  alt="Better Things"
                  width={16}
                  height={16}
                />
                Freelance
              </Link>

              {/* Mobile Social Links */}
              <div className="flex items-center gap-6 pt-4 mt-4 border-t border-gray-100">
                <Link
                  href="https://www.linkedin.com/in/neilmcardle/"
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <LinkedInSolid />
                  <span className="sr-only">LinkedIn</span>
                </Link>
                <Link
                  href="https://neilmcardle.substack.com"
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <SubstackSolid />
                  <span className="sr-only">Substack</span>
                </Link>
                <Link
                  href="https://x.com/betterneil"
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <XSolid />
                  <span className="sr-only">X (Twitter)</span>
                </Link>
                <Link
                  href="https://dribbble.com/neilmacdesign"
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <DribbbleSolid />
                  <span className="sr-only">Dribbble</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}

