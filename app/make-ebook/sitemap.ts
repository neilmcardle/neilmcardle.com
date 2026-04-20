import type { MetadataRoute } from 'next';
import { getAllPosts } from './blog/posts';

// Canonical host for the makeEbook product. The middleware rewrites
// makeebook.ink/* to /make-ebook/* internally, so this sitemap is served at
// makeebook.ink/sitemap.xml even though the file lives under /make-ebook.
const HOST = 'https://makeebook.ink';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${HOST}/`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${HOST}/blog`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];

  const blogPosts: MetadataRoute.Sitemap = getAllPosts().map((post) => ({
    url: `${HOST}/blog/${post.slug}`,
    lastModified: new Date(post.updatedDate ?? post.date),
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [...staticRoutes, ...blogPosts];
}
