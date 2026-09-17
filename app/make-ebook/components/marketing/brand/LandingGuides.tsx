import Image from "next/image";
import Link from "next/link";
import { getAllPosts } from "../../../blog/posts";
import styles from "./landing.module.css";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function GuideCards() {
  return (
    <div className={styles.guides}>
      {getAllPosts()
        .slice(0, 4)
        .map((post) => (
          <Link
            key={post.slug}
            href={`/make-ebook/blog/${post.slug}`}
            className={styles.guide}
          >
            <span className={styles.guideThumb}>
              {post.image && (
                <Image
                  src={post.image}
                  alt=""
                  fill
                  sizes="112px"
                  className={styles.guideThumbImage}
                />
              )}
            </span>
            <span className={styles.guideMeta}>
              {formatDate(post.date)} &middot; {post.category}
            </span>
            <span className={styles.guideTitle}>{post.title}</span>
            <span className={styles.guideRead}>{post.readingTime}</span>
          </Link>
        ))}
    </div>
  );
}

export function GuideLinks() {
  return (
    <>
      {getAllPosts()
        .slice(0, 4)
        .map((post) => (
          <li key={post.slug}>
            <Link href={`/make-ebook/blog/${post.slug}`}>
              {post.title.split(":")[0]}
            </Link>
          </li>
        ))}
    </>
  );
}
