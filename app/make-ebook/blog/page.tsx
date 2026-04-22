import Link from "next/link";
import { getAllPosts } from "./posts";
import { ArrowRight } from "lucide-react";
import MarketingNav from "../components/MarketingNav";
import MarketingFooter from "../components/MarketingFooter";

export default function BlogIndex() {
  const posts = getAllPosts();

  // Blog + ItemList schema — tells Google this is a collection of posts and
  // gives each one enough metadata to appear in rich results.
  const blogSchema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': 'https://makeebook.ink/blog#blog',
    name: 'makeEbook Blog',
    description:
      'Guides, tips, and tools for writing, formatting, and self-publishing ebooks.',
    url: 'https://makeebook.ink/blog',
    publisher: {
      '@type': 'Organization',
      name: 'makeEbook',
      logo: {
        '@type': 'ImageObject',
        url: 'https://makeebook.ink/make-ebook-logomark.svg',
      },
    },
    blogPost: posts.map((post) => ({
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.description,
      url: `https://makeebook.ink/blog/${post.slug}`,
      datePublished: post.date,
      dateModified: post.updatedDate ?? post.date,
      author: {
        '@type': 'Person',
        name: 'Neil McArdle',
        url: 'https://neilmcardle.com',
      },
    })),
  };

  return (
    <div className="relative min-h-screen bg-me-cream text-gray-700">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
      />
      <MarketingNav />

      {/* Header */}
      <header id="main-content" className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pt-20 pb-16 sm:pt-28 sm:pb-20">
        <div className="max-w-3xl">
          <h1
            className="font-serif font-bold text-gray-900 text-balance"
            style={{
              fontSize: 'clamp(2.5rem, 5vw + 0.5rem, 4.5rem)',
              letterSpacing: '-0.04em',
              lineHeight: 1.02,
            }}
          >
            Ebook writing &amp; self-publishing guides
          </h1>
          <p
            className="mt-6 text-xl sm:text-2xl text-gray-600 max-w-xl text-pretty"
            style={{ fontFamily: 'Georgia, serif', lineHeight: 1.5 }}
          >
            Practical guides for writing, formatting, and publishing your first ebook on Kindle, Kobo, and Apple Books.
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
              className="group block rounded-2xl border border-gray-200 bg-white overflow-hidden hover:border-gray-300 hover:shadow-sm transition-all"
            >
              {post.image && (
                <div className="aspect-[16/9] bg-me-cream flex items-center justify-center overflow-hidden border-b border-gray-200">
                  <img
                    src={post.image}
                    alt={post.imageAlt ?? post.title}
                    className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-[1.02]"
                    loading="lazy"
                  />
                </div>
              )}
              <div className="p-8">
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
              </div>
            </Link>
          ))}
        </div>
      </main>

      <MarketingFooter showWordmark={false} />
    </div>
  );
}
