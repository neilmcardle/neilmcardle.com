import type { MetadataRoute } from 'next';

const HOST = 'https://makeebook.ink';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Auth-wall and API routes are thin/private content — skip indexing.
        disallow: ['/signin', '/update-password', '/auth/', '/api/'],
      },
    ],
    sitemap: `${HOST}/sitemap.xml`,
    host: HOST,
  };
}
