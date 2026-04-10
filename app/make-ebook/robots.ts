import type { MetadataRoute } from 'next';

const HOST = 'https://makeebook.ink';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // The signin page and any auth-mode URLs aren't worth crawling.
        disallow: ['/signin', '/api/', '/auth/'],
      },
    ],
    sitemap: `${HOST}/sitemap.xml`,
    host: HOST,
  };
}
