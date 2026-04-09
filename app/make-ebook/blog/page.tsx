import Link from "next/link";
import Image from "next/image";
import { getAllPosts } from "./posts";
import { ArrowRight } from "lucide-react";
import MarketingNav from "../components/MarketingNav";

export default function BlogIndex() {
  const posts = getAllPosts();

  return (
    <div className="relative min-h-screen bg-[#faf9f5] text-gray-700">
      <MarketingNav />

      {/* Header */}
      <header className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pt-20 pb-16 sm:pt-28 sm:pb-20">
        <div className="max-w-3xl">
          <h1
            className="font-serif font-bold text-gray-900 text-balance"
            style={{
              fontSize: 'clamp(2.5rem, 5vw + 0.5rem, 4.5rem)',
              letterSpacing: '-0.04em',
              lineHeight: 1.02,
            }}
          >
            Blog
          </h1>
          <p
            className="mt-6 text-xl sm:text-2xl text-gray-600 max-w-xl text-pretty"
            style={{ fontFamily: 'Georgia, serif', lineHeight: 1.5 }}
          >
            Guides, tips, and tools for writing and self-publishing ebooks.
          </p>
        </div>
      </header>

      {/* Posts Grid */}
      <main className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pb-28">
        <div className="grid gap-6 lg:gap-8 md:grid-cols-2 max-w-5xl">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/make-ebook/blog/${post.slug}`}
              className="group block rounded-2xl border border-gray-200 bg-white p-8 hover:border-gray-300 hover:shadow-sm transition-all"
            >
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
                {post.category}
              </span>
              <h2 className="text-xl font-semibold text-gray-900 mt-3 mb-3 text-balance" style={{ letterSpacing: '-0.02em' }}>
                {post.title}
              </h2>
              <p className="text-gray-600 mb-5 line-clamp-2 text-pretty" style={{ fontFamily: 'Georgia, serif', lineHeight: 1.55 }}>
                {post.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {new Date(post.date).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}{" "}
                  &middot; {post.readingTime}
                </span>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-900 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Image src="/make-ebook-logomark.svg" alt="makeEbook" width={120} height={24} className="h-6 w-auto" />
            <span className="text-sm text-gray-500">&copy; {new Date().getFullYear()}</span>
          </div>
          <Link href="/make-ebook" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
            Back to makeEbook
          </Link>
        </div>
      </footer>
    </div>
  );
}
