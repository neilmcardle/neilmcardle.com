"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { ChevronDown, Home } from "lucide-react"
import { FigmaIcon } from "./FigmaIcon"
import { BetterThingsIcon } from "./BetterThingsIcon"
import { LinkedInIcon } from "./LinkedInIcon"
import { MediumIcon } from "./MediumIcon"
import { NMLogoIcon } from "./NMLogoIcon"
import { MakeEbookIcon } from "./MakeEbookIcon"

const XSolid = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="black">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
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
    <header className="sticky top-4 z-50 mx-auto max-w-7xl px-4">
      <nav
        className="flex items-center rounded-full bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/80 px-4 sm:px-6 py-3 shadow-lg relative"
        ref={dropdownRef}
      >
        {/* Logo - always visible */}
        <Link href="/" className="mr-4 sm:mr-8">
          <NMLogoIcon className="text-[#1D1D1F]" />
        </Link>

        {/* Mobile menu button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="ml-auto p-2 text-[#1D1D1F] hover:text-black focus:outline-none focus:ring-2 focus:ring-gray-200 rounded-full lg:hidden"
          aria-expanded={isMenuOpen}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <Home size={24} /> : <Home size={24} />}
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
                  In-House
                </Link>
                <Link
                  href="/better-things"
                  className="flex items-center gap-2 px-4 py-3 text-sm text-[#1D1D1F] hover:bg-[#F5F5F7]"
                  onClick={() => setActiveDropdown(null)}
                >
                  <BetterThingsIcon className="w-4 h-4 text-[#1D1D1F]" />
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
                  In-House
                </Link>
                <Link
                  href="/better-things"
                  className="flex items-center gap-2 text-sm text-[#86868B] hover:text-[#1D1D1F] py-2 pl-4"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <BetterThingsIcon className="w-4 h-4" />
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

