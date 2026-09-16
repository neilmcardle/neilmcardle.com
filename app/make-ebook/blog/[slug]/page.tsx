import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlug, getAllPosts } from "../posts";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { BrandPage } from "../../components/marketing/brand/BrandPage";
import brand from "../../components/marketing/brand/brand.module.css";
import styles from "../blog.module.css";
import { BlogCta } from "../BlogCta";

interface PageProps {
  params: Promise<{ slug: string }>;
}

function wrapTables(html: string) {
  return html
    .replaceAll("<table", '<div class="tableWrap"><table')
    .replaceAll("</table>", "</table></div>");
}

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  const ogImages = post.image
    ? [
        {
          url: post.image,
          width: 1200,
          height: 630,
          alt: post.imageAlt ?? post.title,
        },
      ]
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

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    author: {
      "@type": "Person",
      name: "Neil McArdle",
      url: "https://neilmcardle.com",
    },
    publisher: {
      "@type": "Organization",
      name: "makeEbook",
      logo: {
        "@type": "ImageObject",
        url: "https://makeebook.ink/make-ebook/brand/mark.svg",
      },
    },
    datePublished: post.date,
    dateModified: updatedDate,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://makeebook.ink/blog/${post.slug}`,
    },
    keywords: post.keywords.join(", "),
    articleSection: post.category,
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://makeebook.ink/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: "https://makeebook.ink/blog",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: `https://makeebook.ink/blog/${post.slug}`,
      },
    ],
  };

  const faqSchema =
    post.faqs && post.faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: post.faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: {
              "@type": "Answer",
              text: f.a,
            },
          })),
        }
      : null;

  return (
    <BrandPage>
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
      <main id="main-content" className={`${brand.shell} ${styles.main}`}>
        <article className={styles.article}>
          <Link href="/make-ebook/blog" className={styles.back}>
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            All posts
          </Link>

          {post.image && (
            <div className={styles.heroImage}>
              <img
                src={post.image}
                alt={post.imageAlt ?? post.title}
                loading="eager"
              />
            </div>
          )}

          <header className={styles.header}>
            <p className={styles.eyebrow}>{post.category}</p>
            <h1 className={styles.postTitle}>{post.title}</h1>
            <p className={styles.standfirst}>{post.description}</p>
            <div className={styles.meta}>
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

          <div
            className={styles.prose}
            dangerouslySetInnerHTML={{ __html: wrapTables(post.content) }}
          />

          {post.faqs && post.faqs.length > 0 && (
            <section className={styles.faq}>
              <h2 className={styles.faqTitle}>Frequently asked questions</h2>
              <dl className={styles.faqList}>
                {post.faqs.map((f) => (
                  <div key={f.q}>
                    <dt>{f.q}</dt>
                    <dd>{f.a}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          <BlogCta />
        </article>
      </main>
    </BrandPage>
  );
}
