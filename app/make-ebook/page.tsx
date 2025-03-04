import Link from "next/link"
import { MakeEbookIcon } from "@/components/MakeEbookIcon"
import { MakeEbookComputerIcon } from "@/components/MakeEbookComputerIcon"
import { LinkedInIcon } from "@/components/LinkedInIcon"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Type, CheckCircle, FileType, ArrowLeft, Check } from "lucide-react"

export default function MakeEbook() {
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

            {/* Feature Comparison Section */}
            <section className="py-20 px-4 bg-[#F5F5F7] rounded-2xl">
              <div className="max-w-[980px] mx-auto">
                <h2 className="text-[40px] font-semibold text-center mb-6 text-[#1D1D1F]">Choose Your Plan</h2>
                <p className="text-xl text-[#86868B] text-center max-w-2xl mx-auto mb-16">
                  Select the tier that best fits your ebook creation needs
                </p>

                <div className="grid md:grid-cols-3 gap-8">
                  {/* Write Only Plan */}
                  <div className="bg-white rounded-2xl shadow-sm p-8">
                    <h3 className="text-[32px] font-semibold mb-4 text-[#1D1D1F]">Write Only</h3>
                    <p className="text-[#86868B] text-lg mb-8">
                      Perfect for authors who want to create content from scratch
                    </p>

                    <div className="bg-[#F5F5F7] rounded-xl p-6 mb-6">
                      <ul className="space-y-6">
                        {/* Writing & Formatting */}
                        <li>
                          <h4 className="font-medium text-[#1D1D1F] mb-3">Writing & Formatting</h4>
                          <ul className="space-y-4">
                            <li className="flex items-start">
                              <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                              <span className="text-[#1D1D1F]">
                                Full writing environment with distraction-free mode
                              </span>
                            </li>
                            <li className="flex items-start">
                              <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                              <span className="text-[#1D1D1F]">Basic and advanced formatting tools</span>
                            </li>
                          </ul>
                        </li>

                        {/* Export Options */}
                        <li>
                          <h4 className="font-medium text-[#1D1D1F] mb-3">Export Options</h4>
                          <ul className="space-y-4">
                            <li className="flex items-start">
                              <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                              <span className="text-[#1D1D1F]">Basic downloads (PDF, TXT, DOCX)</span>
                            </li>
                          </ul>
                        </li>

                        {/* Collaboration */}
                        <li>
                          <h4 className="font-medium text-[#1D1D1F] mb-3">Collaboration</h4>
                          <ul className="space-y-4">
                            <li className="flex items-start">
                              <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                              <span className="text-[#1D1D1F]">Basic collaboration features</span>
                            </li>
                          </ul>
                        </li>

                        {/* Storage */}
                        <li>
                          <h4 className="font-medium text-[#1D1D1F] mb-3">Storage</h4>
                          <ul className="space-y-4">
                            <li className="flex items-start">
                              <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                              <span className="text-[#1D1D1F]">Cloud storage for written content</span>
                            </li>
                          </ul>
                        </li>
                      </ul>
                    </div>
                    <p className="text-sm text-[#86868B]">Free with limited storage and downloads</p>
                  </div>

                  {/* Export Only Plan */}
                  <div className="bg-white rounded-2xl shadow-sm p-8">
                    <h3 className="text-[32px] font-semibold mb-4 text-[#1D1D1F]">Export Only</h3>
                    <p className="text-[#86868B] text-lg mb-8">
                      Ideal for converting existing documents to ebook formats
                    </p>

                    <div className="bg-[#F5F5F7] rounded-xl p-6 mb-6">
                      <ul className="space-y-6">
                        {/* Writing & Formatting */}
                        <li>
                          <h4 className="font-medium text-[#1D1D1F] mb-3">Writing & Formatting</h4>
                          <ul className="space-y-4">
                            <li className="flex items-start">
                              <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                              <span className="text-[#1D1D1F]">Basic formatting adjustments for uploads</span>
                            </li>
                            <li className="flex items-start">
                              <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                              <span className="text-[#1D1D1F]">Standardize headings and styles</span>
                            </li>
                          </ul>
                        </li>

                        {/* Export Options */}
                        <li>
                          <h4 className="font-medium text-[#1D1D1F] mb-3">Export Options</h4>
                          <ul className="space-y-4">
                            <li className="flex items-start">
                              <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                              <span className="text-[#1D1D1F]">Professional ebook formats (EPUB3, MOBI, AZW3)</span>
                            </li>
                          </ul>
                        </li>

                        {/* Storage */}
                        <li>
                          <h4 className="font-medium text-[#1D1D1F] mb-3">Storage</h4>
                          <ul className="space-y-4">
                            <li className="flex items-start">
                              <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                              <span className="text-[#1D1D1F]">Temporary storage during conversion</span>
                            </li>
                          </ul>
                        </li>
                      </ul>
                    </div>
                    <p className="text-sm text-[#86868B]">Free with limited uploads and exports</p>
                  </div>

                  {/* Pro Plan */}
                  <div className="bg-white rounded-2xl shadow-sm p-8 ring-2 ring-[#1D1D1F]">
                    <h3 className="text-[32px] font-semibold mb-4 text-[#1D1D1F]">Pro</h3>
                    <p className="text-[#86868B] text-lg mb-8">
                      Complete solution for professional ebook creation and publishing
                    </p>

                    <div className="bg-[#F5F5F7] rounded-xl p-6 mb-6">
                      <ul className="space-y-6">
                        <li className="flex items-start mb-6">
                          <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-[#1D1D1F] font-medium">Everything in Write and Export plus:</span>
                        </li>

                        {/* Advanced Features */}
                        <li>
                          <h4 className="font-medium text-[#1D1D1F] mb-3">Advanced Features</h4>
                          <ul className="space-y-4">
                            <li className="flex items-start">
                              <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                              <span className="text-[#1D1D1F]">Cover design tools and AI assistance</span>
                            </li>
                            <li className="flex items-start">
                              <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                              <span className="text-[#1D1D1F]">
                                Advanced formatting options (multimedia, interactive)
                              </span>
                            </li>
                            <li className="flex items-start">
                              <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                              <span className="text-[#1D1D1F]">Real-time team collaboration</span>
                            </li>
                            <li className="flex items-start">
                              <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                              <span className="text-[#1D1D1F]">Publishing platform integrations</span>
                            </li>
                            <li className="flex items-start">
                              <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                              <span className="text-[#1D1D1F]">Sales analytics and marketing tools</span>
                            </li>
                          </ul>
                        </li>
                      </ul>
                    </div>
                    <p className="text-sm text-[#86868B]">Premium subscription with unlimited access</p>
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

