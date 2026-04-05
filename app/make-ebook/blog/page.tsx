import Link from "next/link";
import Image from "next/image";
import { getAllPosts } from "./posts";
import { ArrowRight } from "lucide-react";

export default function BlogIndex() {
  const posts = getAllPosts();

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/make-ebook" className="flex items-center">
            <Image src="/make-ebook-logomark.svg" alt="makeEbook" width={120} height={24} className="h-6 w-auto" />
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/make-ebook" className="text-sm text-[#444] hover:text-[#111] transition-colors">
              Home
            </Link>
            <Link
              href="/make-ebook"
              className="px-4 py-2 text-sm font-medium bg-[#111] text-white rounded-full hover:bg-[#333] transition-colors"
            >
              Start Writing
            </Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <header className="max-w-5xl mx-auto px-6 pt-16 pb-12">
        <h1 className="text-3xl font-bold text-[#111] mb-2">Blog</h1>
        <p className="text-lg text-[#555]">
          Guides, tips, and tools for writing and self-publishing ebooks.
        </p>
      </header>

      {/* Posts Grid */}
      <main className="max-w-5xl mx-auto px-6 pb-24">
        <div className="grid gap-8 md:grid-cols-2">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/make-ebook/blog/${post.slug}`}
              className="group block border border-gray-200 rounded-xl p-6 hover:border-gray-300 hover:shadow-sm transition-all"
            >
              <span className="text-xs font-medium text-[#888] uppercase tracking-wider">
                {post.category}
              </span>
              <h2 className="text-xl font-semibold text-[#111] mt-2 mb-2 group-hover:text-[#333]">
                {post.title}
              </h2>
              <p className="text-sm text-[#555] mb-4 line-clamp-2">
                {post.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#888]">
                  {new Date(post.date).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}{" "}
                  &middot; {post.readingTime}
                </span>
                <ArrowRight className="w-4 h-4 text-[#888] group-hover:text-[#111] transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-200 bg-white">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/make-ebook-logomark.svg" alt="makeEbook" width={120} height={24} className="h-6 w-auto" />
            <span className="text-sm text-[#555]">&copy; {new Date().getFullYear()}</span>
          </div>
          <Link href="/make-ebook" className="text-sm text-[#444] hover:text-[#111] transition-colors">
            Back to makeEbook
          </Link>
        </div>
      </footer>
    </div>
  );
}
