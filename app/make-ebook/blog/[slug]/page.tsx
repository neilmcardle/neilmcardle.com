import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getPostBySlug, getAllPosts } from "../posts";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";

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
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/make-ebook" className="flex items-center">
            <Image src="/make-ebook-logomark.svg" alt="makeEbook" width={120} height={24} className="h-6 w-auto" />
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/make-ebook/blog" className="text-sm text-[#444] hover:text-[#111] transition-colors">
              Blog
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

      {/* Article */}
      <article className="max-w-3xl mx-auto px-6 pt-12 pb-24">
        {/* Back link */}
        <Link
          href="/make-ebook/blog"
          className="inline-flex items-center gap-1.5 text-sm text-[#888] hover:text-[#111] transition-colors mb-8"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          All posts
        </Link>

        {/* Header */}
        <header className="mb-10">
          <span className="text-xs font-medium text-[#888] uppercase tracking-wider">
            {post.category}
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-[#111] mt-2 mb-3 leading-tight">
            {post.title}
          </h1>
          <p className="text-lg text-[#555] mb-4">{post.description}</p>
          <div className="text-sm text-[#888]">
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
            prose-headings:text-[#111] prose-headings:font-semibold
            prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
            prose-p:text-[#333] prose-p:leading-relaxed
            prose-a:text-[#111] prose-a:underline prose-a:underline-offset-2
            prose-li:text-[#333]
            prose-strong:text-[#111]
            prose-table:text-sm
            prose-th:text-left prose-th:py-2 prose-th:px-3 prose-th:bg-gray-50 prose-th:border prose-th:border-gray-200
            prose-td:py-2 prose-td:px-3 prose-td:border prose-td:border-gray-200
            [&_.lead]:text-lg [&_.lead]:text-[#444] [&_.lead]:leading-relaxed [&_.lead]:mb-8"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* CTA */}
        <div className="mt-16 p-8 bg-gray-50 rounded-xl border border-gray-200 text-center">
          <h3 className="text-xl font-semibold text-[#111] mb-2">
            Ready to write your ebook?
          </h3>
          <p className="text-sm text-[#555] mb-5">
            Start writing for free in your browser. No signup required.
          </p>
          <Link
            href="/make-ebook"
            className="inline-block px-6 py-3 text-sm font-medium bg-[#111] text-white rounded-full hover:bg-[#333] transition-colors"
          >
            Start Writing — Free
          </Link>
        </div>
      </article>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-200 bg-white">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/make-ebook-logomark.svg" alt="makeEbook" width={120} height={24} className="h-6 w-auto" />
            <span className="text-sm text-[#555]">&copy; {new Date().getFullYear()}</span>
          </div>
          <Link href="/make-ebook/blog" className="text-sm text-[#444] hover:text-[#111] transition-colors">
            All posts
          </Link>
        </div>
      </footer>
    </div>
  );
}
