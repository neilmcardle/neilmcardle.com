"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { FileText, Download, Plus, ArrowRight, Check, Edit3, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/Header"
import { MakeEbookIcon } from "@/components/MakeEbookIcon"
import { AuthModal } from "@/components/AuthModal"
import { useAuth } from "@/lib/hooks/useAuth"

export default function ExplorePage() {
  const [isLoaded, setIsLoaded] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <main className="pt-20">
        <section className={`container mx-auto px-4 py-16 text-center transition-all duration-1000 ease-out transform ${isLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}>
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <MakeEbookIcon className="w-32 h-32 text-gray-900" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 tracking-tight">Sign up</h1>
            <p className="text-base text-gray-700 mb-6 max-w-xl mx-auto font-normal">
              Access my free eBook creation tool to start building professional eBooks in minutes.
            </p>
            <ul className="text-gray-700 text-sm mb-8 space-y-2 text-left font-normal max-w-md mx-auto">
              <li className="flex items-center gap-2 justify-center"><FileText className="w-5 h-5" /> Rich text formatting</li>
              <li className="flex items-center gap-2 justify-center"><BookOpen className="w-5 h-5" /> Cover image upload, chapter & metadata management</li>
              <li className="flex items-center gap-2 justify-center"><Download className="w-5 h-5" /> Save to your library and export for ePub eReaders</li>
            </ul>
            <div className="flex justify-center">
              <AuthModal 
                trigger={
                  <Button size="lg" className="bg-gray-900 hover:bg-gray-800 text-white text-base px-8 py-3 rounded-full font-semibold shadow-md mb-2">
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                }
                mode="signup"
              />
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">No credit card required</p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Link href="/make-ebook">
                  <Button size="lg" className="bg-gray-900 hover:bg-gray-800 text-white">
                    Go to eBook Maker
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <AuthModal 
                    trigger={
                      <Button size="lg" className="bg-gray-900 hover:bg-gray-800 text-white">
                        Get Started Free
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    }
                    mode="signup"
                  />
                  <AuthModal 
                    trigger={
                      <button className="text-sm text-gray-600 hover:text-gray-900 underline">
                        Sign in
                      </button>
                    }
                    mode="signin"
                  />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-16 bg-gray-50">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Create Amazing eBooks
            </h2>
            <p className="text-xl text-gray-600">
              Powerful tools designed to make eBook creation simple and professional
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="text-center p-8 bg-white rounded-lg shadow-sm border">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Edit3 className="w-8 h-8 text-gray-900" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Rich Text Editor</h3>
              <p className="text-gray-600">
                Professional WYSIWYG editor with formatting options, images, and multimedia support
              </p>
            </div>

            <div className="text-center p-8 bg-white rounded-lg shadow-sm border">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-8 h-8 text-gray-900" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Chapter Management</h3>
              <p className="text-gray-600">
                Organize your content with intuitive chapter structure and navigation
              </p>
            </div>

            <div className="text-center p-8 bg-white rounded-lg shadow-sm border">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Download className="w-8 h-8 text-gray-900" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">ePub Export</h3>
              <p className="text-gray-600">
                Export your eBooks in ePub format for compatibility with most e-readers
              </p>
            </div>
          </div>
        </section>

        {/* Get Started Section */}
        <section className="container mx-auto px-4 py-16 bg-white">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Free to Get Started
            </h2>
            <p className="text-xl text-gray-600">
              Create unlimited eBooks and export them with our free tool
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="p-8 bg-gray-50 rounded-lg border text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">All Features Included</h3>
              <ul className="space-y-3 mb-8 text-left max-w-md mx-auto">
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-gray-900 mr-3" />
                  <span>Unlimited eBooks</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-gray-900 mr-3" />
                  <span>Rich text editing</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-gray-900 mr-3" />
                  <span>ePub export</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-gray-900 mr-3" />
                  <span>Chapter management</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-gray-900 mr-3" />
                  <span>Cover upload</span>
                </li>
              </ul>
              {user ? (
                <Link href="/make-ebook">
                  <Button className="w-full bg-gray-900 hover:bg-gray-800">
                    Go to eBook Maker
                  </Button>
                </Link>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <AuthModal trigger={
                    <Button className="w-full bg-gray-900 hover:bg-gray-800">
                      Get Started Free
                    </Button>
                  } mode="signup" />
                  <AuthModal 
                    trigger={
                      <button className="text-sm text-gray-600 hover:text-gray-900 underline">
                        Sign in
                      </button>
                    }
                    mode="signin"
                  />
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}