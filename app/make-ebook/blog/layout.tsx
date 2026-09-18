import type React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | makeebook Blog",
    default: "Ebook Writing & Self-Publishing Guides | makeebook Blog",
  },
  description:
    "Guides, tips, and tools for writing, formatting, and self-publishing ebooks. From first draft to published EPUB on Kindle, Kobo, and Apple Books.",
  alternates: {
    canonical: "https://makeebook.ink/blog",
  },
  openGraph: {
    siteName: "makeebook",
    type: "website",
    url: "https://makeebook.ink/blog",
    images: [
      {
        url: "/make-ebook/brand/social.jpg",
        width: 2400,
        height: 1260,
        alt: "makeebook Blog. Ebook writing and self-publishing guides.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@makeebook",
    images: ["/make-ebook/brand/social.jpg"],
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
