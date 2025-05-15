"use client"
import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { ExternalLink, Mail, ChevronRight } from "lucide-react"
import { PersonaToggle } from "@/components/persona-toggle"
import { usePersona } from "@/contexts/persona-context"
import { cn } from "@/lib/utils"
import { NMLogoIcon } from "@/components/NMLogoIcon"
import { LinkedInIcon } from "@/components/LinkedInIcon"
import { MediumIcon } from "@/components/MediumIcon"

// Custom X icon
const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M12.6 2h1.9L9.7 7.6l5.7 6.4h-4.2l-3.5-3.9-4 3.9H1.8l5.2-6-5.4-6h4.3l3.2 3.6L12.6 2zm-1.7 12.1h1.1L5.3 3.8H4.1l6.8 10.3z" />
  </svg>
)

export default function Home() {
  // Animation states
  const [isLoaded, setIsLoaded] = useState(false)
  const { persona } = usePersona()
  const containerRef = useRef<HTMLDivElement>(null)
  const [shouldScroll, setShouldScroll] = useState(false)

  useEffect(() => {
    // Set isLoaded to true after a short delay to ensure components are mounted
    const timer = setTimeout(() => {
      setIsLoaded(true)
    }, 100)

    return () => {
      clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    const checkOverflow = () => {
      if (containerRef.current) {
        const containerHeight = containerRef.current.scrollHeight
        const windowHeight = window.innerHeight
        setShouldScroll(containerHeight > windowHeight)
      }
    }

    // Check on initial load and whenever the window is resized
    checkOverflow()
    window.addEventListener("resize", checkOverflow)

    // Also check after a short delay to ensure all content is rendered
    const timer = setTimeout(checkOverflow, 500)

    return () => {
      window.removeEventListener("resize", checkOverflow)
      clearTimeout(timer)
    }
  }, [persona]) // Re-check when persona changes

  // List of products
  const products = [
    { name: "makeEbook", href: "/make-ebook" },
    { name: "Waves", href: "https://wavesapp.vercel.app/" },
    { name: "Vector Paint", href: "https://vectorpaint.vercel.app" },
  ]

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex flex-col items-center min-h-screen px-4 relative",
        shouldScroll ? "overflow-auto" : "overflow-hidden",
      )}
    >
      {/* Background with styling based on persona */}
      <div
        className={cn(
          "fixed inset-0 z-[-1] transition-all duration-700",
          persona === "digital" ? "bg-white" : "bg-gray-100",
        )}
      ></div>

      <div className="w-full max-w-6xl mx-auto relative z-[15] flex flex-col justify-center h-full py-8">
        {/* Simplified Navigation */}
        <div className="flex justify-center mb-8">
          <div className="flex flex-col items-center gap-4">
            <NMLogoIcon className={persona === "digital" ? "text-black w-10 h-10" : "text-white w-10 h-10"} />
            <PersonaToggle />
          </div>
        </div>

        {/* Main Content */}
        <section
          className={`transition-all duration-1000 ease-out transform ${isLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
        >
          {persona === "digital" ? (
            // Digital Mode - Business Card Layout
            <div className="flex flex-col items-center w-full">
              {/* Business Card - Standard dimensions 3.5" x 2" (88.9mm x 50.8mm) with aspect ratio preserved */}
              <div
                className="relative w-full max-w-md rounded-lg overflow-hidden shadow-2xl mx-auto"
                style={{
                  background: "linear-gradient(135deg, #000000, #111111)",
                  border: "2px solid #d4b86a",
                }}
              >
                {/* Card Content */}
                <div className="flex flex-col justify-between h-full p-6 text-white space-y-4">
                  {/* Top Section - Logo and Name */}
                  <div>
                    <h1 className="text-xl font-bold text-white mb-1">Neil McArdle</h1>
                  </div>

                  {/* Middle Section - Brief Description */}
                  <div className="mt-0">
                    <p className="text-sm text-gray-300 max-w-xs -mt-2">
                      Creating elegant digital experiences through clean, purposeful code.
                    </p>
                  </div>

                  {/* Products Section */}
                  <div className="mb-3">
                    <h3 className="text-xs uppercase text-[#d4b86a] mb-2 font-medium tracking-wider">Products</h3>
                    <div className="flex flex-col gap-1">
                      {products.map((product, index) => (
                        <Link
                          key={index}
                          href={product.href}
                          className="text-sm text-gray-300 hover:text-[#d4b86a] transition-colors py-1 flex items-center justify-between"
                          target={product.href.startsWith("http") ? "_blank" : undefined}
                          rel={product.href.startsWith("http") ? "noopener noreferrer" : undefined}
                        >
                          <span>{product.name}</span>
                          <ChevronRight className="w-3 h-3 text-[#d4b86a]" />
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Section - Contact and Links */}
                  <div className="flex flex-col gap-3 mt-auto pt-3 border-t border-gray-800">
                    {/* Contact Section */}
                    <div>
                      <h3 className="text-xs uppercase text-[#d4b86a] mb-2 font-medium tracking-wider">Contact</h3>
                      {/* Email - Make more prominent */}
                      <div className="flex items-center text-sm text-white bg-[#1a1a1a] p-2 rounded-md border border-[#333333]">
                        <Mail className="w-4 h-4 mr-2 text-[#d4b86a]" />
                        <span>neil@neilmcardle.com</span>
                      </div>
                    </div>
                    {/* Social Links */}
                    <div className="mt-2">
                      <h3 className="text-xs uppercase text-[#d4b86a] mb-2 font-medium tracking-wider">Read my mind</h3>
                      <div className="flex items-center gap-6">
                        <Link
                          href="https://www.linkedin.com/in/neilmcardle/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white hover:text-[#d4b86a] transition-colors"
                        >
                          <LinkedInIcon className="w-4 h-4" />
                        </Link>
                        <Link
                          href="https://x.com/betterneil"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white hover:text-[#d4b86a] transition-colors"
                        >
                          <XIcon />
                        </Link>
                        <Link
                          href="https://medium.com/@BetterNeil"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white hover:text-[#d4b86a] transition-colors"
                        >
                          <MediumIcon className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>

                    {/* Design Agency Link - Moved to bottom */}
                    <Link
                      href="https://www.betterthings.design"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-white hover:text-[#f0d78a] transition-colors mt-2 underline"
                    >
                      <span>Looking for my design agency?</span>
                      <ExternalLink className="w-3 h-3 ml-1 text-[#d4b86a]" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Contact Information Below Card - Moved to a separate div with margin-top */}
            </div>
          ) : (
            // Traditional Mode Layout with Painting
            <div className="flex flex-col items-center w-full">
              <div className="relative w-full max-w-md mx-auto flex flex-col items-center">
                {/* Dark Grey Gradient Frame */}
                <div
                  className="rounded-sm shadow-xl mx-auto"
                  style={{
                    background: "linear-gradient(to bottom, #444, #222)",
                    padding: "16px",
                  }}
                >
                  {/* Painting - Removed border and centered */}
                  <div className="relative bg-white flex justify-center">
                    <Image
                      src="/bonsai-painting.png"
                      alt="From the Tree - Oil Painting by Neil McArdle"
                      width={400}
                      height={500}
                      className="object-contain"
                    />
                  </div>
                </div>

                {/* Painting Information */}
                <div className="absolute -bottom-24 left-0 right-0">
                  <div className="space-y-1 text-center">
                    <h3 className="font-serif font-medium text-gray-900">From the Tree</h3>
                    <p className="text-sm text-gray-700 font-serif">Oil on board, 9 W x 12 H x 1 D in</p>
                    <div className="flex justify-center items-center gap-2 mt-1">
                      <span className="text-sm font-serif text-gray-900">£1,200</span>
                      <span className="text-xs text-gray-500">|</span>
                      <Link
                        href="https://www.greengallery.space/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-sm text-green-700 font-serif underline"
                      >
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse"></div>
                        Available at Green Gallery
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="ml-1 h-3 w-3 text-green-600"
                        >
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                          <polyline points="15 3 21 3 21 9" />
                          <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Social Links for Traditional View */}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
