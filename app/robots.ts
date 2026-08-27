import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",

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
