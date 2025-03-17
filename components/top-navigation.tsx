"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { ChevronDown, Menu, X } from "lucide-react"
import { FigmaIcon } from "./FigmaIcon"
import { LinkedInIcon } from "./LinkedInIcon"
import { MediumIcon } from "./MediumIcon"
import { NMLogoIcon } from "./NMLogoIcon"
import { MakeEbookIcon } from "./MakeEbookIcon"
import { BetterThingsSquareLogo } from "./BetterThingsSquareLogo"

const XSolid = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M12.6 2h1.9L9.7 7.6l5.7 6.4h-4.2l-3.5-3.9-4 3.9H1.8l5.2-6-5.4-6h4.3l3.2 3.6L12.6 2zm-1.7 12.1h1.1L5.3 3.8H4.1l6.8 10.3z" />
  </svg>
)

export function TopNavigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const toggleDropdown = (dropdown: string) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown)
  }

  return (
    <header className="fixed top-0 sm:top-4 z-50 w-full left-0 right-0 px-4">
      <nav
        className="flex items-center justify-between bg-white/90 sm:bg-white/80 sm:rounded-full backdrop-blur-md supports-[backdrop-filter]:bg-white/80 px-4 sm:px-6 py-3 relative max-w-7xl mx-auto shadow-sm sm:shadow-none"
        ref={dropdownRef}
      >
        {/* Logo - always visible */}
        <Link href="/" className="mr-4">
          <NMLogoIcon className="text-[#1D1D1F] w-8 h-8" />
        </Link>

        {/* Mobile menu button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2 text-[#1D1D1F] hover:text-black focus:outline-none focus:ring-2 focus:ring-gray-200 rounded-full lg:hidden"
          aria-expanded={isMenuOpen}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-8 flex-1">
          <Link
            href="/about"
            className="flex items-center gap-1 text-sm font-medium text-[#1D1D1F] hover:text-black transition-colors"
          >
            About
          </Link>

          {/* Work Dropdown */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown("work")}
              className="flex items-center gap-1 text-sm font-medium text-[#1D1D1F] hover:text-black transition-colors"
            >
              Work
              <ChevronDown
                size={16}
                className={`transition-transform ${activeDropdown === "work" ? "rotate-180" : ""}`}
              />
            </button>

            {activeDropdown === "work" && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-lg overflow-hidden">
                <Link
                  href="https://www.figma.com/proto/zZcc3Li72GhWFVpv1PxC0O/%F0%9F%91%A8%F0%9F%8F%BC%E2%80%8D%F0%9F%9A%80--Neil-McArdle?page-id=7947%3A56485&node-id=7947-56486&viewport=119%2C809%2C0.29&t=9uLN4opTMa6jNFaW-1&scaling=min-zoom&content-scaling=fixed&starting-point-node-id=7947%3A56486"
                  className="flex items-center gap-2 px-4 py-3 text-sm text-[#1D1D1F] hover:bg-[#F5F5F7]"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setActiveDropdown(null)}
                >
                  <FigmaIcon className="w-4 h-4" />
                  Portfolio
                </Link>
                <Link
                  href="/better-things"
                  className="flex items-center gap-2 px-4 py-3 text-sm text-[#1D1D1F] hover:bg-[#F5F5F7]"
                  onClick={() => setActiveDropdown(null)}
                >
                  <BetterThingsSquareLogo className="w-4 h-4" />
                  Freelance
                </Link>
              </div>
            )}
          </div>

          {/* Products Dropdown */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown("products")}
              className="flex items-center gap-1 text-sm font-medium text-[#1D1D1F] hover:text-black transition-colors"
            >
              Products
              <ChevronDown
                size={16}
                className={`transition-transform ${activeDropdown === "products" ? "rotate-180" : ""}`}
              />
            </button>

            {activeDropdown === "products" && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-lg overflow-hidden">
                <Link
                  href="/make-ebook"
                  className="flex items-center gap-2 px-4 py-3 text-sm text-[#1D1D1F] hover:bg-[#F5F5F7]"
                  onClick={() => setActiveDropdown(null)}
                >
                  <MakeEbookIcon className="w-4 h-4" />
                  makeEbook
                </Link>
              </div>
            )}
          </div>
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
            href="https://x.com/betterneil"
            className="text-sm font-medium"
            target="_blank"
            rel="noopener noreferrer"
          >
            <XSolid />
            <span className="sr-only">X (Twitter)</span>
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
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-white rounded-3xl shadow-lg lg:hidden">
            <div className="flex flex-col gap-4">
              <Link
                href="/about"
                className="flex items-center gap-2 text-sm font-medium text-[#1D1D1F] hover:text-black py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>

              {/* Mobile Work Section */}
              <div className="border-t border-[#D2D2D7] pt-2">
                <div className="text-sm font-medium text-[#1D1D1F] mb-2 py-2">Work</div>
                <Link
                  href="https://www.figma.com/proto/zZcc3Li72GhWFVpv1PxC0O/%F0%9F%91%A8%F0%9F%8F%BC%E2%80%8D%F0%9F%9A%80--Neil-McArdle?page-id=7947%3A56485&node-id=7947-56486&viewport=119%2C809%2C0.29&t=9uLN4opTMa6jNFaW-1&scaling=min-zoom&content-scaling=fixed&starting-point-node-id=7947%3A56486"
                  className="flex items-center gap-2 text-sm text-[#86868B] hover:text-[#1D1D1F] py-2 pl-4"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FigmaIcon className="w-4 h-4" />
                  Portfolio
                </Link>
                <Link
                  href="/better-things"
                  className="flex items-center gap-2 text-sm text-[#86868B] hover:text-[#1D1D1F] py-2 pl-4"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <BetterThingsSquareLogo className="w-4 h-4" />
                  Freelance
                </Link>
              </div>

              {/* Mobile Products Section */}
              <div className="border-t border-[#D2D2D7] pt-2">
                <div className="text-sm font-medium text-[#1D1D1F] mb-2 py-2">Products</div>
                <Link
                  href="/make-ebook"
                  className="flex items-center gap-2 text-sm text-[#86868B] hover:text-[#1D1D1F] py-2 pl-4"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <MakeEbookIcon className="w-4 h-4" />
                  makeEbook
                </Link>
              </div>

              {/* Mobile Social Links */}
              <div className="flex items-center gap-6 pt-4 mt-4 border-t border-[#D2D2D7]">
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
                  href="https://medium.com/@BetterNeil"
                  className="text-sm font-medium"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <MediumIcon className="w-5 h-5" />
                  <span className="sr-only">Medium</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}

