import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getPostBySlug, getAllPosts } from "../posts";
import type { Metadata } from "next";
import { ArrowLeft, ArrowRight } from "lucide-react";
import MarketingNav from "../../components/MarketingNav";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      url: `https://makeebook.ink/blog/${post.slug}`,
      siteName: "makeEbook",
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
    alternates: {
      canonical: `https://makeebook.ink/blog/${post.slug}`,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  return (
    <div className="relative min-h-screen bg-[#faf9f5] text-gray-700">
      <MarketingNav />

      {/* Article */}
      <article className="max-w-3xl mx-auto px-6 sm:px-10 pt-16 sm:pt-20 pb-24">
        {/* Back link */}
        <Link
          href="/make-ebook/blog"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-10"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          All posts
        </Link>

        {/* Header */}
        <header className="mb-12">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
            {post.category}
          </span>
          <h1
            className="font-serif font-bold text-gray-900 mt-3 mb-5 text-balance"
            style={{
              fontSize: 'clamp(2rem, 3vw + 1rem, 3.25rem)',
              letterSpacing: '-0.035em',
              lineHeight: 1.1,
            }}
          >
            {post.title}
          </h1>
          <p
            className="text-lg sm:text-xl text-gray-600 mb-5 text-pretty"
            style={{ fontFamily: 'Georgia, serif', lineHeight: 1.55 }}
          >
            {post.description}
          </p>
          <div className="text-sm text-gray-500">
            {new Date(post.date).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}{" "}
            &middot; {post.readingTime}
          </div>
        </header>

        {/* Content */}
        <div
          className="prose prose-gray max-w-none
            prose-headings:text-gray-900 prose-headings:font-semibold
            prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
            prose-p:text-gray-700 prose-p:leading-relaxed
            prose-a:text-gray-900 prose-a:underline prose-a:underline-offset-2
            prose-li:text-gray-700
            prose-strong:text-gray-900
            prose-table:text-sm
            prose-th:text-left prose-th:py-2 prose-th:px-3 prose-th:bg-gray-100 prose-th:border prose-th:border-gray-200
            prose-td:py-2 prose-td:px-3 prose-td:border prose-td:border-gray-200
            [&_.lead]:text-lg [&_.lead]:text-gray-700 [&_.lead]:leading-relaxed [&_.lead]:mb-8
            [&_p]:text-pretty"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* CTA */}
        <div className="mt-20 p-8 sm:p-10 bg-white rounded-2xl border border-gray-200 text-center">
          <h3
            className="font-serif font-bold text-gray-900 mb-3 text-balance"
            style={{ fontSize: 'clamp(1.5rem, 1vw + 1.25rem, 2rem)', letterSpacing: '-0.03em', lineHeight: 1.15 }}
          >
            Ready to write your ebook?
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto text-pretty" style={{ fontFamily: 'Georgia, serif', lineHeight: 1.55 }}>
            Start writing for free in your browser. No signup required.
          </p>
          <Link
            href="/make-ebook"
            className="group inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors"
          >
            Start writing
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </article>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Image src="/make-ebook-logomark.svg" alt="makeEbook" width={120} height={24} className="h-6 w-auto" />
            <span className="text-sm text-gray-500">&copy; {new Date().getFullYear()}</span>
          </div>
          <Link href="/make-ebook/blog" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
            All posts
          </Link>
        </div>
      </footer>
    </div>
  );
}
