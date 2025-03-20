/*
 * UPDATED:
 * - Removed framer-motion dependency
 * - Replaced motion components with regular div elements
 * - Simplified animations to use CSS only
 * - Maintained black and white testimonial card with gradient on hover
 * - Kept gradient project badges and links
 */

"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { CheckCircle, ArrowRight, Mail, X, Menu, Sparkles, Zap, Rocket } from "lucide-react"
import { BetterThingsIconStamp } from "@/components/BetterThingsIconStamp"
import "./styles.css"

export default function BetterThings() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isEmailRevealed, setIsEmailRevealed] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  // Email parts are split to prevent scraping
  const emailParts = {
    username: "neil",
    domain: "neilmcardle",
    tld: "com",
  }

  const handleRevealEmail = () => {
    setIsEmailRevealed(true)
  }

  const handleCopyEmail = () => {
    const email = `${emailParts.username}@${emailParts.domain}.${emailParts.tld}`
    navigator.clipboard.writeText(email)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <svg
                width="32"
                height="32"
                viewBox="0 0 73.68 73.68"
                className="text-[#000000]"
                aria-label="Better Things Logo"
              >
                <g>
                  <path d="M0,0v73.68h73.68V0H0ZM65.68,65.68H8V8h57.68v57.68Z" fill="currentColor" />
                </g>
              </svg>
              <span className="ml-2 text-xl font-bold text-black">Better Things</span>
            </div>

            {/* Desktop Navigation - now takes the place of the button */}
            <nav className="hidden md:flex space-x-8">
              <a href="#services" className="text-gray-800 hover:text-[#FF5757] transition-colors font-medium">
                Services
              </a>
              <a href="#process" className="text-gray-800 hover:text-[#FF5757] transition-colors font-medium">
                Process
              </a>
              <a href="#projects" className="text-gray-800 hover:text-[#FF5757] transition-colors font-medium">
                Projects
              </a>
              <a href="#testimonials" className="text-gray-800 hover:text-[#FF5757] transition-colors font-medium">
                Testimonials
              </a>
              <a href="#pricing" className="text-gray-800 hover:text-[#FF5757] transition-colors font-medium">
                Pricing
              </a>
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-800 p-2">
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <a
                href="#services"
                className="block px-3 py-2 text-gray-800 hover:bg-gray-50 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Services
              </a>
              <a
                href="#process"
                className="block px-3 py-2 text-gray-800 hover:bg-gray-50 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Process
              </a>
              <a
                href="#projects"
                className="block px-3 py-2 text-gray-800 hover:bg-gray-50 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Projects
              </a>
              <a
                href="#testimonials"
                className="block px-3 py-2 text-gray-800 hover:bg-gray-50 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Testimonials
              </a>
              <button
                onClick={handleRevealEmail}
                className="w-full text-left px-3 py-2 text-gray-800 hover:bg-gray-50 rounded-md"
              >
                Get in touch
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-32 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="blob-shape w-96 h-96 gradient-purple top-0 left-0 opacity-20"></div>
        <div className="blob-shape w-96 h-96 gradient-orange bottom-0 right-0 opacity-20"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <div className="flex justify-center mb-6">
              <BetterThingsIconStamp className="h-32 w-32 text-black" />
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-black mb-6 leading-tight">
              Fast. Dedicated.
              <br />
              <span className="vibrant-gradient-text">Unlimited Design.</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto">
              One designer. Unlimited requests. Lightning-fast turnaround.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {!isEmailRevealed ? (
                <a
                  href="#pricing"
                  className="relative inline-flex items-center justify-center px-8 py-4 rounded-full text-white font-medium transition-all duration-200 overflow-hidden group"
                  style={{
                    boxShadow:
                      "0 10px 25px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.2)",
                    background: "linear-gradient(135deg, #ff5757 -10%, #8c52ff 110%)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                  }}
                >
                  {/* Top gradient shine */}
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-b from-white/20 to-transparent opacity-50 group-hover:opacity-70 transition-opacity"></span>
                  <span className="absolute inset-0 w-full h-[40%] bg-gradient-to-b from-white/30 to-transparent"></span>

                  {/* Single horizontal shine effect that moves on hover */}
                  <span className="absolute inset-y-0 left-[-100%] w-[35%] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-100 group-hover:translate-x-[250%] transition-transform duration-1500 ease-in-out"></span>

                  <span className="relative z-10">View Pricing</span>
                </a>
              ) : (
                <div
                  className="relative inline-flex items-center justify-center px-6 py-4 rounded-full text-white font-medium"
                  style={{
                    boxShadow:
                      "0 10px 25px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.2)",
                    background: "linear-gradient(135deg, #ff5757 -10%, #8c52ff 110%)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                  }}
                >
                  <span className="absolute inset-0 w-full h-[40%] bg-gradient-to-b from-white/20 to-transparent rounded-full"></span>
                  <span className="font-medium relative z-10">
                    {emailParts.username}@{emailParts.domain}.{emailParts.tld}
                  </span>
                  <button
                    onClick={handleCopyEmail}
                    className="ml-3 p-1 rounded-full hover:bg-white/10 transition-colors relative z-10"
                  >
                    {isCopied ? <CheckCircle className="h-5 w-5 text-green-300" /> : <Mail className="h-5 w-5" />}
                    <span className="sr-only">{isCopied ? "Copied" : "Copy to clipboard"}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      {/* Trusted By Section - Enhanced */}
      <section className="py-20 bg-white relative overflow-hidden">
        {/* Add subtle background elements */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full brand-gradient opacity-20 blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-64 h-64 rounded-full brand-gradient opacity-20 blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">Trusted by innovative brands</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Partnering with forward-thinking companies to create exceptional design experiences.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
              <div className="flex items-center">
                <div className="w-16 h-16 rounded-2xl overflow-hidden mr-4 brand-gradient p-0.5">
                  <div className="w-full h-full bg-white rounded-xl overflow-hidden">
                    <Image
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/nuk-soo-card-banner-Ej605KiiolTu8x60MWYAJMGfLj5AdH.png"
                      alt="NUK SOO"
                      width={60}
                      height={60}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div>
                  <div className="text-gray-800 font-bold text-xl mb-1">NUK SOO</div>
                  <p className="text-gray-600 text-sm">Brand Identity & Digital Design</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
              <div className="flex items-center">
                <div className="w-16 h-16 rounded-2xl overflow-hidden mr-4 brand-gradient p-0.5">
                  <div className="w-full h-full bg-white rounded-xl overflow-hidden">
                    <Image
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/gatewick-house-gardens-card-banner-yPo8986u4vDLre49VxlfSilnAhDCdl.png"
                      alt="Gatewick Gardens"
                      width={60}
                      height={60}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div>
                  <div className="text-gray-800 font-bold text-xl mb-1">Gatewick Gardens</div>
                  <p className="text-gray-600 text-sm">Brand Identity & Website Design</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="process" className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 emoji-bg"></div>
        <div className="absolute inset-0 bg-white/90"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">How Better Things works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get all your design work done for a simple monthly fee — pause or cancel anytime. No team to manage, no
              freelancers to coordinate, just me delivering exceptional design incredibly fast.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto animate-fade-in-up">
            <div className="bg-white rounded-3xl p-8 text-center shadow-xl hover:shadow-2xl transition-shadow vibrant-card">
              <div className="w-16 h-16 brand-gradient text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="font-bold text-2xl">1</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Request</h3>
              <p className="text-gray-600">
                Submit your design request and I'll get started immediately. No waiting for team availability.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 text-center shadow-xl hover:shadow-2xl transition-shadow vibrant-card">
              <div className="w-16 h-16 brand-gradient text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="font-bold text-2xl">2</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Design</h3>
              <p className="text-gray-600">
                I'll work on your design with rapid turnaround. Most projects delivered within 24-48 hours.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 text-center shadow-xl hover:shadow-2xl transition-shadow vibrant-card">
              <div className="w-16 h-16 brand-gradient text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="font-bold text-2xl">3</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Revise</h3>
              <p className="text-gray-600">
                Quick revisions until you're 100% satisfied. Direct communication means faster iterations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">All included in your subscription</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              One monthly fee covers all your design needs. No extra charges, no surprise fees.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 animate-fade-in-up">
            <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-shadow vibrant-card">
              <div className="w-14 h-14 brand-gradient text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6"
                >
                  <path d="M12 19l9 2-9-18-9 18 9-2z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Brand Identity</h3>
              <p className="text-gray-600">
                Logo design, brand guidelines, visual identity systems, and brand strategy.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-shadow vibrant-card">
              <div className="w-14 h-14 brand-gradient text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="3" y1="9" x2="21" y2="9"></line>
                  <line x1="9" y1="21" x2="9" y2="9"></line>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">UI/UX Design</h3>
              <p className="text-gray-600">
                User interfaces, user experience, wireframes, prototypes, and usability testing.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-shadow vibrant-card">
              <div className="w-14 h-14 brand-gradient text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6"
                >
                  <path d="M12 19l7-7 3 3-7 7-3-3z"></path>
                  <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path>
                  <path d="M2 2l7.586 7.586"></path>
                  <circle cx="11" cy="11" r="2"></circle>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Illustration</h3>
              <p className="text-gray-600">Custom illustrations, icons, infographics, and visual storytelling.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects Section */}
      <section id="projects" className="py-20 relative overflow-hidden">
        <div className="blob-shape w-96 h-96 gradient-blue top-1/4 right-0 opacity-10"></div>
        <div className="blob-shape w-96 h-96 gradient-orange bottom-1/4 left-0 opacity-10"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">Featured projects</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A selection of recent work that showcases my design approach and capabilities.
            </p>
          </div>

          <div className="max-w-5xl mx-auto space-y-20">
            {/* NUK SOO Project */}
            <div className="flex flex-col md:flex-row items-center gap-12 animate-fade-in-up">
              <div className="w-full md:w-1/2 vibrant-card hover:scale-102 transition-transform">
                <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl">
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/nuk-soo-card-banner-Ej605KiiolTu8x60MWYAJMGfLj5AdH.png"
                    alt="NUK SOO - Bold geometric branding"
                    fill
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="inline-block bg-black/70 px-2 py-1 rounded text-white text-xs font-medium mb-2">
                      Brand Identity
                    </div>
                    <h3 className="text-white text-2xl font-bold">NUK SOO</h3>
                  </div>
                </div>
              </div>

              <div className="w-full md:w-1/2">
                <div className="inline-flex items-center px-3 py-1 bg-white border border-gray-200 rounded-md mb-2 font-medium text-gray-700">
                  Brand Identity
                </div>
                <h3 className="text-3xl font-bold text-gray-800 mb-4">NUK SOO</h3>
                <p className="text-gray-600 mb-6">
                  Collaborated with Dan Roberts to create a striking visual identity for NUK SOO, enhancing their brand
                  presence in the industry with bold geometric patterns and distinctive typography.
                </p>
                <Link
                  href="https://danrobertsgroup.com/nuksoo/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 rounded-full brand-gradient text-white hover:opacity-90 transition-opacity font-medium"
                >
                  View on Dan Roberts Group
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Gatewick Gardens Project */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-12 animate-fade-in-up">
              <div className="w-full md:w-1/2 vibrant-card hover:scale-102 transition-transform">
                <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl">
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/gatewick-house-gardens-card-banner-yPo8986u4vDLre49VxlfSilnAhDCdl.png"
                    alt="Gatewick Gardens - Elegant architectural illustration"
                    fill
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="inline-block bg-black/70 px-2 py-1 rounded text-white text-xs font-medium mb-2">
                      Brand & Digital
                    </div>
                    <h3 className="text-white text-2xl font-bold">Gatewick House & Gardens</h3>
                  </div>
                </div>
              </div>

              <div className="w-full md:w-1/2">
                <div className="inline-flex items-center px-3 py-1 bg-white border border-gray-200 rounded-md mb-2 font-medium text-gray-700">
                  Brand & Digital
                </div>
                <h3 className="text-3xl font-bold text-gray-800 mb-4">Gatewick House & Gardens</h3>
                <p className="text-gray-600 mb-6">
                  Developed an elegant and timeless design for Gatewick House & Gardens, showcasing their beautiful
                  landscapes and historic architecture through refined typography and a sophisticated color palette.
                </p>
                <Link
                  href="https://www.instagram.com/gatewick_gardens/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 rounded-full brand-gradient text-white hover:opacity-90 transition-opacity font-medium"
                >
                  View on Instagram
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">What clients say</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Don't just take my word for it - hear from the brands I've worked with.
            </p>
          </div>

          <div className="max-w-3xl mx-auto animate-fade-in-up">
            <div className="testimonial-card bg-white rounded-3xl p-8 shadow-xl hover:-translate-y-1 transition-transform">
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="#FFBD59"
                    stroke="#FFBD59"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6 star-icon"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-600 text-lg mb-8">
                "Neil is a talented designer who has an impressive work ethic. He has assisted on number of key design
                projects for our brand and he over-delivers each and every time! Neil is a delight to work with and I
                can't recommend him enough."
              </p>
              <div className="flex items-center">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/dan-or2ZMicLq3DNbbnxNnCFXvZP8jsrt5.png"
                  alt="Dan Roberts"
                  width={56}
                  height={56}
                  className="rounded-full mr-4 border-2 border-white shadow-md"
                />
                <div>
                  <p className="font-bold text-gray-800">Dan Roberts</p>
                  <p className="text-gray-500 text-sm">NUK SOO</p>
                </div>
              </div>
            </div>

            {/* Add Guy Sanderson's testimonial */}
            <div className="testimonial-card bg-white rounded-3xl p-8 shadow-xl hover:-translate-y-1 transition-transform mt-8">
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="#FFBD59"
                    stroke="#FFBD59"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6 star-icon"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-600 text-lg mb-8">
                "I really enjoyed working with Neil. His skill brought my vision to life and he was happy to adapt and
                refine ideas until we had a logo and signage that perfectly suit Gatewick Gardens. I'm thrilled with the
                result."
              </p>
              <div className="flex items-center">
                <div className="w-14 h-14 rounded-full mr-4 border-2 border-white shadow-md overflow-hidden flex-shrink-0">
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/gatewick-house-gardens-card-banner-yPo8986u4vDLre49VxlfSilnAhDCdl.png"
                    alt="Guy Sanderson - Gatewick Gardens"
                    width={56}
                    height={56}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-bold text-gray-800">Guy Sanderson</p>
                  <p className="text-gray-500 text-sm">Gatewick Gardens</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">Why Better Things is different</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              No agencies. No junior designers. No complex pricing. Just one experienced designer dedicated to your
              success.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto animate-fade-in-up">
            <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-shadow vibrant-card">
              <div className="flex gap-4">
                <div className="w-12 h-12 brand-gradient text-white rounded-full flex items-center justify-center flex-shrink-0">
                  <Zap className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Lightning Fast Turnaround</h3>
                  <p className="text-gray-600">
                    Most requests completed within 24-48 hours. No waiting for team availability or agency approvals.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-shadow vibrant-card">
              <div className="flex gap-4">
                <div className="w-12 h-12 brand-gradient text-white rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">One Dedicated Designer</h3>
                  <p className="text-gray-600">
                    Work directly with me — no account managers, no junior designers, no miscommunication.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-shadow vibrant-card">
              <div className="flex gap-4">
                <div className="w-12 h-12 brand-gradient text-white rounded-full flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Simple Monthly Pricing</h3>
                  <p className="text-gray-600">
                    Predictable cost with no hidden fees. Pause or cancel anytime — no long-term contracts.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-shadow vibrant-card">
              <div className="flex gap-4">
                <div className="w-12 h-12 brand-gradient text-white rounded-full flex items-center justify-center flex-shrink-0">
                  <Rocket className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Unlimited Requests</h3>
                  <p className="text-gray-600">
                    Submit as many design requests as you need. I'll tackle them one by one, quickly and efficiently.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">Pricing</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">One subscription, endless possibilities</p>
          </div>

          <div className="max-w-3xl mx-auto">
            {/* Vibrant Pricing Card */}
            <div
              className="rounded-3xl p-1 shadow-2xl animate-fade-in-up vibrant-card"
              style={{
                background: "linear-gradient(135deg, #ff5757 -10%, #8c52ff 110%)",
                boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
              }}
            >
              <div className="bg-black rounded-[calc(1.5rem-4px)] p-8 h-full">
                <div className="flex justify-between items-start mb-8">
                  <h3 className="text-2xl font-bold text-white">Design Partnership</h3>
                  <span className="text-xs text-white/70 bg-white/10 px-3 py-1 rounded-full">
                    PAUSE OR CANCEL ANYTIME
                  </span>
                </div>

                <div className="border-t border-white/10 my-6"></div>

                <div className="mb-8">
                  <div className="flex items-baseline">
                    <span className="text-5xl md:text-6xl font-bold text-white">£2,995</span>
                    <span className="text-white/70 ml-2">/month</span>
                  </div>
                </div>

                <div className="bg-white/5 rounded-2xl p-6 mb-8">
                  <div className="text-xs uppercase text-white/50 mb-4">INCLUDED</div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-[#FF5757] mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-white">One request at a time</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-[#FF5757] mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-white">Unlimited stock photos</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-[#FF5757] mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-white">Avg. 48 hour delivery</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-[#FF5757] mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-white">Up to 2 users</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-[#FF5757] mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-white">Unlimited brands</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-[#FF5757] mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-white">Pause or cancel anytime</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleRevealEmail}
                  className="w-full relative overflow-hidden group bg-gradient-to-r from-[#FF5757] to-[#8c52ff] text-white py-4 rounded-full font-medium transition-all"
                >
                  {/* Shine effect */}
                  <span className="absolute inset-y-0 left-[-100%] w-[35%] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-100 group-hover:translate-x-[250%] transition-transform duration-1500 ease-in-out"></span>

                  <div className="flex items-center justify-center relative z-10">
                    {isEmailRevealed ? (
                      <div className="flex items-center">
                        <span>
                          {emailParts.username}@{emailParts.domain}.{emailParts.tld}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleCopyEmail()
                          }}
                          className="ml-3 p-1 rounded-full hover:bg-white/10 transition-colors"
                        >
                          {isCopied ? <CheckCircle className="h-5 w-5 text-green-300" /> : <Mail className="h-5 w-5" />}
                          <span className="sr-only">{isCopied ? "Copied" : "Copy to clipboard"}</span>
                        </button>
                      </div>
                    ) : (
                      "Get in Touch to Join"
                    )}
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 vibrant-gradient-bg text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-shadow">Ready for faster design?</h2>
            <p className="text-xl mb-10 text-white/90">
              Get all your design work done for one monthly fee. Fast turnaround, dedicated service, and the flexibility
              to pause or cancel anytime. No risk, just results.
            </p>

            {!isEmailRevealed ? (
              <button
                onClick={handleRevealEmail}
                className="relative inline-flex items-center justify-center px-8 py-4 rounded-full text-white font-medium transition-all duration-200 overflow-hidden group mx-auto"
                style={{
                  boxShadow:
                    "0 10px 25px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.2)",
                  background: "linear-gradient(135deg, #ff5757 -10%, #8c52ff 110%)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                }}
              >
                {/* Top gradient shine */}
                <span className="absolute inset-0 w-full h-full bg-gradient-to-b from-white/20 to-transparent opacity-50 group-hover:opacity-70 transition-opacity"></span>
                <span className="absolute inset-0 w-full h-[40%] bg-gradient-to-b from-white/30 to-transparent"></span>

                {/* Single horizontal shine effect that moves on hover */}
                <span className="absolute inset-y-0 left-[-100%] w-[35%] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-100 group-hover:translate-x-[250%] transition-transform duration-1500 ease-in-out"></span>

                <span className="relative z-10">Get Started</span>
              </button>
            ) : (
              <div
                className="relative inline-flex items-center justify-center px-6 py-4 rounded-full text-white font-medium mx-auto"
                style={{
                  boxShadow:
                    "0 10px 25px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.2)",
                  background: "linear-gradient(135deg, #ff5757 -10%, #8c52ff 110%)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                }}
              >
                <span className="absolute inset-0 w-full h-[40%] bg-gradient-to-b from-white/20 to-transparent rounded-full"></span>
                <span className="font-medium relative z-10">
                  {emailParts.username}@{emailParts.domain}.{emailParts.tld}
                </span>
                <button
                  onClick={handleCopyEmail}
                  className="ml-3 p-1 rounded-full hover:bg-white/10 transition-colors relative z-10"
                >
                  {isCopied ? <CheckCircle className="h-5 w-5 text-green-500" /> : <Mail className="h-5 w-5" />}
                  <span className="sr-only">{isCopied ? "Copied" : "Copy to clipboard"}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-6 md:mb-0">
              <BetterThingsIconStamp className="h-8 w-8 text-[#000000]" />
              <span className="text-xl font-bold text-gray-800">Better Things</span>
            </div>
            <div className="flex gap-6">
              <Link href="/" className="text-gray-500 hover:text-[#FF5757] transition-colors">
                neilmcardle.com
              </Link>
              <Link
                href="https://www.linkedin.com/in/neilmcardle/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-[#FF5757] transition-colors"
              >
                LinkedIn
              </Link>
              <Link
                href="https://x.com/betterneil"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-[#FF5757] transition-colors"
              >
                Twitter
              </Link>
              <Link
                href="https://dribbble.com/neilmacdesign"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-[#FF5757] transition-colors"
              >
                Dribbble
              </Link>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-8 pt-8 text-center md:text-left">
            <p className="text-gray-500">© {new Date().getFullYear()} Better Things. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

