import Link from "next/link"
import { MakeEbookIcon } from "@/components/MakeEbookIcon"
import { MakeEbookComputerIcon } from "@/components/MakeEbookComputerIcon"
import { LinkedInIcon } from "@/components/LinkedInIcon"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Type, CheckCircle, FileType, Home } from "lucide-react"

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
              <Button variant="ghost" size="icon" aria-label="Go to home page" className="text-[#1D1D1F]">
                <Home className="h-6 w-6" />
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
                  Connect on LinkedIn to Join Waitlist
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
                  <h3 className="text-[24px] font-semibold mb-2 text-[#1D1D1F]">Stunning Rich Text Formatting</h3>
                  <p className="text-[17px] text-[#86868B] leading-relaxed">
                    Transform your words into beautifully styled eBooks with intuitive, easy-to-use formatting tools—no
                    design skills required.
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

        <section className="py-20 px-4 bg-white text-center">
          <div className="max-w-[980px] mx-auto">
            <h2 className="text-[40px] font-semibold mb-4 text-[#1D1D1F]">Want to Make eBooks Like a Pro?</h2>
            <p className="text-xl mb-10 text-[#86868B]">Create. Validate. Publish. All in one powerful platform.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="https://www.linkedin.com/in/neilmcardle/" target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="text-lg bg-[#1D1D1F] hover:bg-black text-white rounded-full px-8">
                  <LinkedInIcon className="w-5 h-5 mr-2 fill-white" />
                  Connect on LinkedIn to Join Waitlist
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8 px-4 bg-[#F5F5F7] border-t border-[#D2D2D7]">
        <div className="max-w-[980px] mx-auto">
          <div className="text-sm text-[#86868B]">© 2025 makeEbook. All rights reserved.</div>
        </div>
      </footer>
    </div>
  )
}

