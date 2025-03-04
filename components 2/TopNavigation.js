"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"

export default function TopNavigation() {
  const [isPersonalOpen, setIsPersonalOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsPersonalOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/">
              <a className="font-bold text-xl">NM</a>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex space-x-8">
            <Link href="/about">
              <a className="text-gray-600 hover:text-gray-900">About Me</a>
            </Link>

            {/* Personal Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsPersonalOpen(!isPersonalOpen)}
                className="text-gray-600 hover:text-gray-900 inline-flex items-center"
              >
                Personal
                <svg
                  className={`ml-2 h-5 w-5 transform transition-transform duration-200 ${
                    isPersonalOpen ? "rotate-180" : ""
                  }`}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {isPersonalOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                  <div className="py-1" role="menu">
                    <Link href="/icon-creator">
                      <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Icon Creator</a>
                    </Link>
                    <Link href="/vector-paint">
                      <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Vector Paint</a>
                    </Link>
                    <Link href="/home-move-calculator">
                      <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Home Move Calculator</a>
                    </Link>
                    <Link href="/property-investment-calculator">
                      <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Property Investment Calculator
                      </a>
                    </Link>
                    <Link href="/makeebook">
                      <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">makeEbook</a>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link href="/web">
              <a className="text-gray-600 hover:text-gray-900">Web</a>
            </Link>
            <Link href="/app">
              <a className="text-gray-600 hover:text-gray-900">App</a>
            </Link>
            <Link href="/design-systems">
              <a className="text-gray-600 hover:text-gray-900">Design Systems</a>
            </Link>
          </nav>

          {/* Social Links */}
          <div className="hidden md:flex items-center space-x-6">
            <a
              href="https://neilmcardle.substack.com"
              className="text-gray-600 hover:text-gray-900"
              target="_blank"
              rel="noopener noreferrer"
            >
              SubStack
            </a>
            <a
              href="https://x.com/BetterNeil"
              className="text-gray-600 hover:text-gray-900"
              target="_blank"
              rel="noopener noreferrer"
            >
              X
            </a>
            <a
              href="https://dribbble.com/neilmacdesign"
              className="text-gray-600 hover:text-gray-900"
              target="_blank"
              rel="noopener noreferrer"
            >
              Dribbble
            </a>
          </div>
        </div>
      </div>
    </header>
  )
}

