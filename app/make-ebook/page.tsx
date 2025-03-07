"use client"

import { useState } from "react"
import Link from "next/link"
import { MakeEbookIcon } from "@/components/MakeEbookIcon"
import { MakeEbookComputerIcon } from "@/components/MakeEbookComputerIcon"
import { LinkedInIcon } from "@/components/LinkedInIcon"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Type, CheckCircle, FileType, ArrowLeft, Lock } from "lucide-react"
import { MakeEbookDemo } from "./make-ebook-demo" // Updated import path

export default function MakeEbook() {
  const [selectedTier, setSelectedTier] = useState<"basic" | "pro" | null>(null)

  const handleTierSelect = (tier: "basic" | "pro") => {
    setSelectedTier(tier)
  }

  return (
    <div className="flex flex-col min-h-screen relative bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="max-w-[980px] mx-auto px-4 pt-4">
          <nav className="flex items-center justify-between bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/80 rounded-full px-4 py-3">
            <div className="flex items-center space-x-2">
              <MakeEbookIcon width={32} height={32} className="text-[#1D1D1F]" />
              <span className="text-xl font-semibold text-[#1D1D1F]">makeEbook</span>
            </div>
            <Link href="/" passHref>
              <Button variant="ghost" size="icon" aria-label="Return to main site" className="text-[#1D1D1F]">
                <ArrowLeft className="h-6 w-6" />
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-grow pt-[100px]">
        <section className="py-20 px-4 text-center bg-white">
          <div className="max-w-[980px] mx-auto">
            <div className="flex justify-center mb-8">
              <MakeEbookComputerIcon width={240} height={240} className="text-[#1D1D1F]" />
            </div>
            <h1 className="text-[56px] leading-tight font-semibold tracking-tight mb-4 text-[#1D1D1F]">
              Create Ebooks in Minutes
            </h1>
            <p className="text-xl md:text-2xl text-[#86868B] max-w-2xl mx-auto mb-10">
              Simple eBook Creation with Professional Results
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="https://www.linkedin.com/in/neilmcardle/" target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="text-lg bg-[#1D1D1F] hover:bg-black text-white rounded-full px-8">
                  <LinkedInIcon className="w-5 h-5 mr-2 fill-white" />
                  Connect to Join the Waitlist
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section id="features" className="py-20 px-4 bg-[#F5F5F7]">
          <div className="max-w-[980px] mx-auto">
            <h2 className="text-[40px] font-semibold text-center mb-16 text-[#1D1D1F]">Why Choose makeEbook?</h2>
            <div className="grid md:grid-cols-3 gap-12">
              <Card className="bg-white border-0 shadow-sm rounded-2xl">
                <CardContent className="p-8">
                  <div className="mb-6">
                    <Type className="h-10 w-10 text-[#1D1D1F]" />
                  </div>
                  <h3 className="text-[24px] font-semibold mb-2 text-[#1D1D1F]">Write in Our Platform</h3>
                  <p className="text-[17px] text-[#86868B] leading-relaxed">
                    Create your content from scratch with easy-to-use formatting tools in our clean, distraction-free
                    writing environment designed for focus and creativity.
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-white border-0 shadow-sm rounded-2xl">
                <CardContent className="p-8">
                  <div className="mb-6">
                    <CheckCircle className="h-10 w-10 text-[#1D1D1F]" />
                  </div>
                  <h3 className="text-[24px] font-semibold mb-2 text-[#1D1D1F]">Flawless, Verified eBooks</h3>
                  <p className="text-[17px] text-[#86868B] leading-relaxed">
                    Ensure your eBooks are eReader-ready with built-in validation, guaranteeing seamless compatibility
                    across all major platforms.
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-white border-0 shadow-sm rounded-2xl">
                <CardContent className="p-8">
                  <div className="mb-6">
                    <FileType className="h-10 w-10 text-[#1D1D1F]" />
                  </div>
                  <h3 className="text-[24px] font-semibold mb-2 text-[#1D1D1F]">Publish in Industry-Leading Formats</h3>
                  <p className="text-[17px] text-[#86868B] leading-relaxed">
                    Export your work in ePub3, MOBI, and AZW3, ensuring your book is ready for Kindle, Apple Books, and
                    more—hassle-free.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* New Flexibility Section */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-[980px] mx-auto">
            <h2 className="text-[40px] font-semibold text-center mb-6 text-[#1D1D1F]">Your eBook, Your Way</h2>
            <p className="text-xl text-[#86868B] text-center max-w-2xl mx-auto mb-16">
              Choose how you want to create and publish your eBook with our flexible platform
            </p>

            {/* Interactive Demo Section */}
            <section className="py-20 px-4 bg-[#F5F5F7] rounded-2xl mb-20">
              <div className="max-w-[980px] mx-auto">
                <h2 className="text-[40px] font-semibold text-center mb-6 text-[#1D1D1F]">Try It Now</h2>
                <p className="text-xl text-[#86868B] text-center max-w-2xl mx-auto mb-16">
                  Create a simple eBook right here to see how easy it is
                </p>

                <div className="bg-white rounded-2xl shadow-sm p-8 max-w-3xl mx-auto">
                  <MakeEbookDemo />
                </div>
              </div>
            </section>

            {/* Feature Comparison Section */}
            <section id="pricing" className="py-20 px-4 bg-[#F5F5F7] rounded-2xl">
              {" "}
              {/* Updated section ID */}
              <div className="max-w-[980px] mx-auto">
                <div className="flex flex-col items-center justify-center mb-6">
                  <h2 className="text-[40px] font-semibold text-center text-[#1D1D1F]">Choose Your Plan</h2>
                  <div className="flex items-center gap-2 mt-2 px-4 py-2 bg-[#1D1D1F]/10 rounded-full">
                    <Lock className="h-4 w-4 text-[#1D1D1F]" />
                    <span className="text-sm text-[#1D1D1F]">makeEbook is currently in development</span>
                  </div>
                </div>
                <p className="text-xl text-[#86868B] text-center max-w-2xl mx-auto mb-16">
                  Select the tier that best fits your ebook creation needs
                </p>

                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                  {/* Basic Plan */}
                  <div
                    className={`bg-white rounded-2xl shadow-sm p-8 cursor-pointer transition-all duration-300 ${
                      selectedTier === "basic"
                        ? "ring-2 ring-green-500 transform scale-[1.02] shadow-md"
                        : "hover:shadow-md"
                    }`}
                    onClick={() => handleTierSelect("basic")}
                  >
                    <h3 className="text-[32px] font-semibold mb-2 text-[#1D1D1F]">Basic</h3>
                    <div className="inline-block bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full mb-6">
                      Free
                    </div>
                    <p className="text-[#86868B] text-lg mb-8">
                      Essential tools for getting started with ebook creation
                    </p>

                    <div className="bg-[#F5F5F7] rounded-xl p-6 mb-6">
                      <ul className="space-y-4">
                        <li className="flex items-start">
                          <div className="mr-3 mt-0.5 text-green-500 flex-shrink-0">✓</div>
                          <span className="text-[#1D1D1F]">
                            <strong>Try Before You Buy:</strong> Create and preview eBooks directly in your browser
                            (like our demo above)
                          </span>
                        </li>
                        <li className="flex items-start">
                          <div className="mr-3 mt-0.5 text-green-500 flex-shrink-0">✓</div>
                          <span className="text-[#1D1D1F]">
                            Create Basic eBooks: Design and generate simple eBooks with standard formatting
                          </span>
                        </li>
                        <li className="flex items-start">
                          <div className="mr-3 mt-0.5 text-green-500 flex-shrink-0">✓</div>
                          <span className="text-[#1D1D1F]">
                            Essential Book Details: Add title, author, genre, and other basic metadata
                          </span>
                        </li>
                        <li className="flex items-start">
                          <div className="mr-3 mt-0.5 text-green-500 flex-shrink-0">✓</div>
                          <span className="text-[#1D1D1F]">Chapter Management: Add and edit multiple chapters</span>
                        </li>
                        <li className="flex items-start">
                          <div className="mr-3 mt-0.5 text-green-500 flex-shrink-0">✓</div>
                          <span className="text-[#1D1D1F]">
                            Cover Image Upload: Upload a custom cover image for your eBook
                          </span>
                        </li>
                        <li className="flex items-start">
                          <div className="mr-3 mt-0.5 text-green-500 flex-shrink-0">✓</div>
                          <span className="text-[#1D1D1F]">
                            Basic Preview: Preview how your eBook will look before generating
                          </span>
                        </li>
                        <li className="flex items-start">
                          <div className="mr-3 mt-0.5 text-green-500 flex-shrink-0">✓</div>
                          <span className="text-[#1D1D1F]">
                            Single Format Export: Export your writing in PDF format
                          </span>
                        </li>
                        <li className="flex items-start">
                          <div className="mr-3 mt-0.5 text-green-500 flex-shrink-0">✓</div>
                          <span className="text-[#1D1D1F]">
                            Static Design: Create simple eBooks to read on any device
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Pro Plan */}
                  <div
                    className={`bg-white rounded-2xl shadow-sm p-8 cursor-pointer transition-all duration-300 ${
                      selectedTier === "pro"
                        ? "ring-2 ring-blue-500 transform scale-[1.02] shadow-md"
                        : "hover:shadow-md"
                    }`}
                    onClick={() => handleTierSelect("pro")}
                  >
                    <h3 className="text-[32px] font-semibold mb-2 text-[#1D1D1F]">Pro</h3>
                    <div className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full mb-6">
                      £14.99/month
                    </div>
                    <p className="text-[#86868B] text-lg mb-8">
                      Complete solution for professional ebook creation and publishing
                    </p>

                    <div className="bg-[#F5F5F7] rounded-xl p-6 mb-6">
                      <p className="text-[#1D1D1F] font-medium mb-4">Everything in Basic, plus:</p>
                      <ul className="space-y-4">
                        <li className="flex items-start">
                          <div className="mr-3 mt-0.5 text-blue-500 flex-shrink-0">✓</div>
                          <span className="text-[#1D1D1F]">
                            Multiple Format Export: Generate your eBook in various formats (EPUB, AZW3, MOBI and PDF)
                          </span>
                        </li>
                        <li className="flex items-start">
                          <div className="mr-3 mt-0.5 text-blue-500 flex-shrink-0">✓</div>
                          <span className="text-[#1D1D1F]">
                            Save & Edit Drafts: Save your work and come back to it later
                          </span>
                        </li>
                        <li className="flex items-start">
                          <div className="mr-3 mt-0.5 text-blue-500 flex-shrink-0">✓</div>
                          <span className="text-[#1D1D1F]">
                            Advanced Formatting Options: Enhanced styling with custom fonts, tables, image captions, and
                            more
                          </span>
                        </li>
                        <li className="flex items-start">
                          <div className="mr-3 mt-0.5 text-blue-500 flex-shrink-0">✓</div>
                          <span className="text-[#1D1D1F]">
                            ISBN Integration: Add your own ISBN for eBook publishing
                          </span>
                        </li>
                        <li className="flex items-start">
                          <div className="mr-3 mt-0.5 text-blue-500 flex-shrink-0">✓</div>
                          <span className="text-[#1D1D1F]">
                            No Watermarks: Remove "Created with makeEbook" from your eBooks
                          </span>
                        </li>
                        <li className="flex items-start">
                          <div className="mr-3 mt-0.5 text-blue-500 flex-shrink-0">✓</div>
                          <span className="text-[#1D1D1F]">Priority Support: Get help when you need it</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="py-20 px-4 bg-white text-center">
              <div className="max-w-[980px] mx-auto">
                <h2 className="text-[40px] font-semibold mb-4 text-[#1D1D1F]">Want to Make eBooks Like a Pro?</h2>
                <p className="text-xl mb-10 text-[#86868B]">Create. Validate. Publish. All in one powerful platform.</p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link href="https://www.linkedin.com/in/neilmcardle/" target="_blank" rel="noopener noreferrer">
                    <Button size="lg" className="text-lg bg-[#1D1D1F] hover:bg-black text-white rounded-full px-8">
                      <LinkedInIcon className="w-5 h-5 mr-2 fill-white" />
                      Connect to Join the Waitlist
                    </Button>
                  </Link>
                </div>
              </div>
            </section>
          </div>
        </section>

        <footer className="py-8 px-4 bg-[#F5F5F7] border-t border-[#D2D2D7]">
          <div className="max-w-[980px] mx-auto">
            <div className="text-sm text-[#86868B]">© 2025 makeEbook. All rights reserved.</div>
          </div>
        </footer>
      </main>
    </div>
  )
}

