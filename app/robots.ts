import type { MetadataRoute } from "next";

// This robots.ts serves /robots.txt on neilmcardle.com. makeebook.ink is
// a separate domain on the same deploy with its own /make-ebook/robots.ts
// and sitemap. Both sitemap URLs are advertised here so crawlers can find
// everything even if they land on the wrong host first.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // /portfolio/ is a password-gated in-house portfolio for job
        // searches. Kept out of search results entirely. The HTML itself
        // also carries noindex/nofollow as a second line of defence.
        disallow: ["/api/", "/auth/", "/portfolio/", "/portfolio-unlock"],
      },
    ],
    sitemap: [
      "https://neilmcardle.com/sitemap.xml",
      "https://makeebook.ink/sitemap.xml",
    ],
  };
}
