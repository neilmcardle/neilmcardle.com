import type { MetadataRoute } from "next";

// robots.txt for the personal site; both sitemaps are advertised so crawlers
// can find everything from either host.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Keep gated and in-progress routes out of search results.
        disallow: [
          "/api/",
          "/auth/",
          "/portfolio/",
          "/portfolio-unlock",
          "/cabin",
          "/kids-academy",
          "/wepray",
        ],
      },
    ],
    sitemap: [
      "https://neilmcardle.com/sitemap.xml",
      "https://makeebook.ink/sitemap.xml",
    ],
  };
}
