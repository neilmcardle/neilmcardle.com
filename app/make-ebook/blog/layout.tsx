import type React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | makeEbook Blog",
    default: "makeEbook Blog — Ebook Writing & Self-Publishing Guides",
  },
  description:
    "Guides, tips, and tools for writing, formatting, and self-publishing ebooks. From first draft to published EPUB.",
  openGraph: {
    siteName: "makeEbook",
    type: "website",
    url: "https://makeebook.ink/blog",
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
