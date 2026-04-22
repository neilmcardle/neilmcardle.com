import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlug, getAllPosts } from "../posts";
import type { Metadata } from "next";
import { ArrowLeft, ArrowRight } from "lucide-react";
import MarketingNav from "../../components/MarketingNav";
import MarketingFooter from "../../components/MarketingFooter";

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

  // When the post has a hero illustration, use it for OG and Twitter cards
  // so the social preview carries the same visual identity as the post page.
  const ogImages = post.image
    ? [{
        url: post.image,
        width: 1200,
        height: 630,
        alt: post.imageAlt ?? post.title,
      }]
    : undefined;

  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    authors: [{ name: "Neil McArdle", url: "https://neilmcardle.com" }],
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      modifiedTime: post.updatedDate ?? post.date,
      authors: ["https://neilmcardle.com"],
      url: `https://makeebook.ink/blog/${post.slug}`,
      siteName: "makeEbook",
      ...(ogImages && { images: ogImages }),
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      ...(post.image && { images: [post.image] }),
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

  const updatedDate = post.updatedDate ?? post.date;
  const wasUpdated = updatedDate !== post.date;

  // Article schema.org JSON-LD — gives Google enough metadata to render rich
  // results (publish date, author, headline, breadcrumbs).
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    author: {
      '@type': 'Person',
      name: 'Neil McArdle',
      url: 'https://neilmcardle.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'makeEbook',
      logo: {
        '@type': 'ImageObject',
        url: 'https://makeebook.ink/make-ebook-logomark.svg',
      },
    },
    datePublished: post.date,
    dateModified: updatedDate,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://makeebook.ink/blog/${post.slug}`,
    },
    keywords: post.keywords.join(', '),
    articleSection: post.category,
  };

  // Breadcrumb schema. Lets Google render a breadcrumb trail under the post
  // in search results (Home, Blog, Post title).
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://makeebook.ink/' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://makeebook.ink/blog' },
      { '@type': 'ListItem', position: 3, name: post.title, item: `https://makeebook.ink/blog/${post.slug}` },
    ],
  };

  // FAQPage schema. When the post has structured FAQs, we emit JSON-LD so
  // Google can render them as a rich result. The visible HTML below mirrors
  // the same data so what users see matches what crawlers read.
  const faqSchema = post.faqs && post.faqs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: post.faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.a,
      },
    })),
  } : null;

  return (
    <div className="relative min-h-screen bg-me-cream text-gray-700">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <MarketingNav />

      {/* Article */}
      <article id="main-content" className="max-w-3xl mx-auto px-6 sm:px-10 pt-16 sm:pt-20 pb-24">
        {/* Back link */}
        <Link
          href="/make-ebook/blog"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-10"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          All posts
        </Link>

        {/* Hero illustration — ink on cream paper, sets the post's visual tone */}
        {post.image && (
          <div className="mb-10 -mx-6 sm:mx-0">
            <div className="aspect-[16/9] bg-me-cream rounded-none sm:rounded-xl overflow-hidden flex items-center justify-center">
              <img
                src={post.image}
                alt={post.imageAlt ?? post.title}
                className="w-full h-full object-contain"
                loading="eager"
              />
            </div>
          </div>
        )}

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
            {wasUpdated ? (
              <>
                Updated{" "}
                {new Date(updatedDate).toLocaleDateString("en-GB", {
                  month: "long",
                  year: "numeric",
                })}
              </>
            ) : (
              new Date(post.date).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })
            )}{" "}
            &middot; {post.readingTime}
          </div>
        </header>

        {/* Content */}
        <div
          className="prose prose-gray max-w-none
            prose-headings:text-gray-900 prose-headings:font-semibold
            prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
            prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-3
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

        {/* FAQ — structured, rendered from post.faqs so it matches the JSON-LD */}
        {post.faqs && post.faqs.length > 0 && (
          <section className="mt-16 pt-12 border-t border-gray-200">
            <h2 className="font-serif font-bold text-gray-900 text-2xl mb-8" style={{ letterSpacing: '-0.02em' }}>
              Frequently asked questions
            </h2>
            <dl className="space-y-8">
              {post.faqs.map((f, i) => (
                <div key={i}>
                  <dt className="font-semibold text-gray-900 mb-2">{f.q}</dt>
                  <dd className="text-gray-700 leading-relaxed text-pretty">{f.a}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

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

      <MarketingFooter showWordmark={false} />
    </div>
  );
}
