import Link from "next/link";
import { getAllPosts } from "./posts";
import { ArrowRight } from "lucide-react";
import { BrandPage } from "../components/marketing/brand/BrandPage";
import brand from "../components/marketing/brand/brand.module.css";
import styles from "./blog.module.css";
import { BlogCta } from "./BlogCta";

export default function BlogIndex() {
  const posts = getAllPosts();

  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": "https://makeebook.ink/blog#blog",
    name: "makeEbook Blog",
    description:
      "Guides, tips, and tools for writing, formatting, and self-publishing ebooks.",
    url: "https://makeebook.ink/blog",
    publisher: {
      "@type": "Organization",
      name: "makeEbook",
      logo: {
        "@type": "ImageObject",
        url: "https://makeebook.ink/make-ebook/brand/mark.svg",
      },
    },
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      description: post.description,
      url: `https://makeebook.ink/blog/${post.slug}`,
      datePublished: post.date,
      dateModified: post.updatedDate ?? post.date,
      author: {
        "@type": "Person",
        name: "Neil McArdle",
        url: "https://neilmcardle.com",
      },
    })),
  };

  return (
    <BrandPage>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
      />
      <main id="main-content" className={`${brand.shell} ${styles.main}`}>
        <header className={styles.hero}>
          <p className={styles.eyebrow}>Blog</p>
          <h1 className={styles.title}>
            Ebook writing and self-publishing guides
          </h1>
          <p className={styles.lede}>
            Practical guides for writing, formatting, and publishing your first
            ebook on Kindle, Kobo, and Apple Books.
          </p>
        </header>

        <div className={styles.grid}>
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/make-ebook/blog/${post.slug}`}
              className={styles.card}
            >
              {post.image && (
                <div className={styles.cardImage}>
                  <img
                    src={post.image}
                    alt={post.imageAlt ?? post.title}
                    loading="lazy"
                  />
                </div>
              )}
              <div className={styles.cardBody}>
                <span className={styles.eyebrow} style={{ margin: 0 }}>
                  {post.category}
                </span>
                <h2 className={styles.cardTitle}>{post.title}</h2>
                <p className={styles.cardText}>{post.description}</p>
                <div className={styles.cardMeta}>
                  <span>
                    {new Date(post.date).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}{" "}
                    &middot; {post.readingTime}
                  </span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className={styles.article}>
          <BlogCta />
        </div>
      </main>
    </BrandPage>
  );
}
