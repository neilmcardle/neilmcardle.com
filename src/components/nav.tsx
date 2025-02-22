"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import {
  Home,
  BookOpen,
  Calculator,
  Star,
  Palette,
  Globe,
  Twitter,
  XIcon,
  Bookmark,
  Briefcase,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react"

export default function Nav() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Listen for custom event from MobileHeader
  useEffect(() => {
    const handleToggle = () => setIsMobileMenuOpen((prev) => !prev)
    window.addEventListener("toggleMobileMenu", handleToggle)
    return () => window.removeEventListener("toggleMobileMenu", handleToggle)
  }, [])

  const navLinks = {
    Home: [{ name: "Home", href: "/", icon: Home }],
    FREELANCE: [{ name: "Better Things", href: "/better-things", icon: Briefcase }],
    PASSION: [
      { name: "Icon Creator 🚧", href: "/icon-creator", icon: Star },
      { name: "Vector Paint 🚧", href: "/vector-paint", icon: Palette },
      { name: "Home Move Calc", href: "/home-move-calculator", icon: Calculator },
      { name: "Prop Invest Calc", href: "/property-investment-calculator", icon: Calculator },
      { name: "Make eBook", href: "/make-ebook", icon: BookOpen },
    ],
    ONLINE: [
      { name: "X", href: "https://x.com/BetterNeil", external: true, icon: XIcon },
      { name: "Dribbble", href: "https://dribbble.com/NeilMacDesign", external: true, icon: Globe },
      { name: "LinkedIn", href: "https://linkedin.com/in/neilmcardle", external: true, icon: Globe },
      { name: "Substack", href: "https://neilmcardle.substack.com", external: true, icon: Bookmark },
    ],
  }

  return (
    <>
      {/* Backdrop */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/20 z-30 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}
      <nav
        className={`
          fixed left-0 top-0 h-screen bg-white border-r transition-all duration-300 ease-in-out z-40
          ${isCollapsed || (typeof window !== "undefined" && window.innerWidth < 1024 && window.innerWidth > 768) ? "w-16" : "w-64"}
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Site Logo and Toggle Button */}
          <div className="flex items-center h-20 border-b">
            <Link
              href="/"
              className={`
                flex items-center h-full
                ${isCollapsed ? "justify-center px-2 flex-1" : "px-6 flex-1"}
              `}
            >
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/NM-kHgsD6UZubvkyK3g650dvcdDcy8z1R.svg"
                alt="Neil McArdle Logo"
                width={isCollapsed ? 32 : 48}
                height={isCollapsed ? 16 : 24}
                className="transition-all duration-300"
                style={{
                  fontWeight: 600,
                  letterSpacing: "-0.02em",
                }}
              />
            </Link>
            <button
              className="flex items-center justify-center h-full w-16 hover:bg-gray-100 transition-colors border-l"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              {isCollapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
            </button>
          </div>

          {/* Navigation Sections */}
          <div className="flex-1 overflow-y-auto py-6">
            {Object.entries(navLinks).map(([category, links]) => (
              <div key={category}>
                {!isCollapsed && category !== "Home" && (
                  <h2 className="text-sm text-gray-500 px-6 h-8 flex items-center">{category}</h2>
                )}
                {isCollapsed && category !== "Home" && <div className="h-8" />}
                <ul>
                  {links.map((link) => (
                    <li key={link.name} className="h-10">
                      <Link
                        href={link.href}
                        target={link.external ? "_blank" : undefined}
                        rel={link.external ? "noopener noreferrer" : undefined}
                        className={`
                          flex items-center h-full text-[15px] transition-colors
                          ${isCollapsed ? "justify-center w-16 mx-auto" : "px-6"}
                          ${
                            pathname === link.href
                              ? "bg-gray-100 text-gray-900"
                              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                          }
                        `}
                      >
                        <div className={`flex items-center ${isCollapsed ? "w-8 justify-center" : "w-8"}`}>
                          <link.icon className="h-[18px] w-[18px] flex-shrink-0" strokeWidth={1.5} />
                        </div>
                        {!isCollapsed && <span className="ml-3">{link.name}</span>}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </nav>
    </>
  )
}

