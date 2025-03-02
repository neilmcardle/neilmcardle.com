"use client"

import { useState } from "react"
import Link from "next/link"
import { Home, User, Menu, X } from "lucide-react"
import { FigmaIcon } from "./FigmaIcon"
import { BetterThingsIcon } from "./BetterThingsIcon"
import { LinkedInIcon } from "./LinkedInIcon"
import { MediumIcon } from "./MediumIcon"
import { DribbbleIcon } from "./DribbbleIcon"
import { NMLogoIcon } from "./NMLogoIcon"

const XSolid = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="black">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

export function TopNavigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="sticky top-4 z-50 mx-auto max-w-7xl px-4">
      <nav className="flex items-center rounded-full bg-white px-4 sm:px-6 py-4 shadow-lg relative">
        {/* Logo - always visible */}
        <Link href="/" className="mr-4 sm:mr-8">
          <NMLogoIcon className="text-black" />
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
            <FigmaIcon className="w-4 h-4" />
            In-House
          </Link>
          <Link
            href="/better-things"
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            <BetterThingsIcon className="w-4 h-4 text-gray-600" />
            Freelance
          </Link>
        </div>

        {/* Desktop Social Links */}
        <div className="hidden lg:flex items-center gap-6">
          <Link
            href="https://www.linkedin.com/in/neilmcardle/"
            className="text-sm font-medium"
            target="_blank"
            rel="noopener noreferrer"
          >
            <LinkedInIcon className="w-4 h-4" />
            <span className="sr-only">LinkedIn</span>
          </Link>
          <Link
            href="https://medium.com/@BetterNeil"
            className="text-sm font-medium"
            target="_blank"
            rel="noopener noreferrer"
          >
            <MediumIcon className="w-5 h-5" />
            <span className="sr-only">Medium</span>
          </Link>
          <Link
            href="https://x.com/betterneil"
            className="text-sm font-medium"
            target="_blank"
            rel="noopener noreferrer"
          >
            <XSolid />
            <span className="sr-only">X (Twitter)</span>
          </Link>
          <Link
            href="https://dribbble.com/neilmacdesign"
            className="text-sm font-medium"
            target="_blank"
            rel="noopener noreferrer"
          >
            <DribbbleIcon className="w-5 h-5" />
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
                <FigmaIcon className="w-4 h-4" />
                In-House
              </Link>
              <Link
                href="/better-things"
                className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <BetterThingsIcon className="w-4 h-4 text-gray-600" />
                Freelance
              </Link>

              {/* Mobile Social Links */}
              <div className="flex items-center gap-6 pt-4 mt-4 border-t border-gray-100">
                <Link
                  href="https://www.linkedin.com/in/neilmcardle/"
                  className="text-sm font-medium"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <LinkedInIcon className="w-4 h-4" />
                  <span className="sr-only">LinkedIn</span>
                </Link>
                <Link
                  href="https://medium.com/@BetterNeil"
                  className="text-sm font-medium"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <MediumIcon className="w-5 h-5" />
                  <span className="sr-only">Medium</span>
                </Link>
                <Link
                  href="https://x.com/betterneil"
                  className="text-sm font-medium"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <XSolid />
                  <span className="sr-only">X (Twitter)</span>
                </Link>
                <Link
                  href="https://dribbble.com/neilmacdesign"
                  className="text-sm font-medium"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <DribbbleIcon className="w-5 h-5" />
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

