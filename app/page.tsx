import Link from "next/link";
import { ArrowRight, BookOpen, Zap, Users } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative px-6 lg:px-8">
        <div className="mx-auto max-w-3xl pt-20 pb-32 sm:pt-48 sm:pb-40">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Create Beautiful <span className="text-indigo-600">eBooks</span> Effortlessly
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Professional eBook creation tool with rich text editing, chapter management, and export capabilities. 
              No technical skills required.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/make-ebook"
                className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 flex items-center gap-2"
              >
                Start Creating <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/about"
                className="text-sm font-semibold leading-6 text-gray-900"
              >
                Learn more <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 pb-20">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-indigo-600">Everything you need</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Professional eBook creation made simple
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            <div className="flex flex-col">
              <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                <BookOpen className="h-5 w-5 flex-none text-indigo-600" />
                Rich Text Editor
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                <p className="flex-auto">Full-featured editor with formatting, images, and chapter organization.</p>
              </dd>
            </div>
            <div className="flex flex-col">
              <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                <Zap className="h-5 w-5 flex-none text-indigo-600" />
                Export Ready
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                <p className="flex-auto">Export to EPUB format ready for publishing on any platform.</p>
              </dd>
            </div>
            <div className="flex flex-col">
              <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                <Users className="h-5 w-5 flex-none text-indigo-600" />
                User Friendly
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                <p className="flex-auto">Intuitive interface designed for writers, not developers.</p>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}