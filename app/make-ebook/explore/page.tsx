"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { FileText, Download, Plus, ArrowRight, Check } from "lucide-react"
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
            <div className="flex justify-center mb-8">
              <div className="p-4 bg-gray-100 rounded-full">
                <MakeEbookIcon className="w-16 h-16 text-gray-900" />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Create Beautiful
              <span className="block text-gray-900">eBooks Effortlessly</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Professional eBook creation tool with rich text editing, chapter management, and export capabilities. 
              Perfect for authors, educators, and content creators.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Link href="/make-ebook">
                  <Button size="lg" className="bg-gray-900 hover:bg-gray-800 text-white">
                    Go to eBook Maker
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              ) : (
                <AuthModal 
                  trigger={
                    <Button size="lg" className="bg-gray-900 hover:bg-gray-800 text-white">
                      Get Started Free
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  }
                  mode="signup"
                />
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
                <FileText className="w-8 h-8 text-gray-900" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Rich Text Editor</h3>
              <p className="text-gray-600">
                Professional WYSIWYG editor with formatting options, images, and multimedia support
              </p>
            </div>

            <div className="text-center p-8 bg-white rounded-lg shadow-sm border">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <MakeEbookIcon className="w-8 h-8 text-gray-900" />
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
                <AuthModal trigger={
                  <Button className="w-full bg-gray-900 hover:bg-gray-800">
                    Get Started Free
                  </Button>
                } mode="signup" />
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}