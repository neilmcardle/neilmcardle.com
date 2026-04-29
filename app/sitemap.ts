import type { MetadataRoute } from "next";

// Sitemap for the personal site. Auth-gated routes are excluded.
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
