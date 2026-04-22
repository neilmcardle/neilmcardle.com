import type { MetadataRoute } from "next";

// Personal brand sitemap. makeEbook has its own sitemap at
// /make-ebook/sitemap.xml (canonical lives on makeebook.ink), so we don't
// duplicate it here. prototype-lab/ is excluded because it's auth-gated.
export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://neilmcardle.com";
  const now = new Date();

  return [
    { url: `${base}/`,               lastModified: now, changeFrequency: "monthly", priority: 1.0 },
    { url: `${base}/about`,          lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/icon-animator`,  lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/promptr`,        lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/privacy`,        lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${base}/terms`,          lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
  ];
}
