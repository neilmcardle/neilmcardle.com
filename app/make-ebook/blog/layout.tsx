import type React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | makeEbook Blog",
    default: "Ebook Writing & Self-Publishing Guides | makeEbook Blog",
  },
  description:
    "Guides, tips, and tools for writing, formatting, and self-publishing ebooks. From first draft to published EPUB on Kindle, Kobo, and Apple Books.",
  alternates: {
    canonical: "https://makeebook.ink/blog",
  },
  openGraph: {
    siteName: "makeEbook",
    type: "website",
    url: "https://makeebook.ink/blog",
    images: [
      {
        url: "/social-make-ebook.png",
        width: 1200,
        height: 630,
        alt: "makeEbook Blog. Ebook writing and self-publishing guides.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/social-make-ebook.png"],
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
