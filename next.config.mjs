/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV === 'development'

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: isDev,
  },
  typescript: {
    ignoreBuildErrors: true, // Temporarily ignore for project setup
  },
  images: {
    unoptimized: true, // Keep unoptimized for now until external domains are audited
  },
  // Allow dev origins only in development
  ...(isDev && {
    experimental: {
      allowedDevOrigins: ['*', '*.replit.dev', 'localhost', '127.0.0.1']
    }
  }),
  async headers() {
    return [
      // Development - disable all caching
      ...(isDev ? [{
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      }] : [
        // Production - HTML/API routes with no caching and CSP
        {
          source: '/((?!_next/static|_next/image|favicon.ico).*)',
          headers: [
            {
              key: 'Content-Security-Policy',
              value:
                "default-src 'self'; " +
                "script-src 'self' 'unsafe-inline'; " +
                "style-src 'self' 'unsafe-inline'; " +
                "img-src 'self' data: https:; " +
                "font-src 'self' data:; " +
                "connect-src 'self' https://firebase.googleapis.com https://firestore.googleapis.com https://hhsiuvalashrqtpluxan.supabase.co; " +
                "frame-ancestors 'none';",
            },
            {
              key: 'Cache-Control',
              value: 'private, max-age=0, must-revalidate',
            },
            {
              key: 'X-Frame-Options',
              value: 'DENY',
            },
            {
              key: 'X-Content-Type-Options',
              value: 'nosniff',
            },
            {
              key: 'Referrer-Policy',
              value: 'strict-origin-when-cross-origin',
            },
            {
              key: 'Permissions-Policy',
              value: 'camera=(), microphone=(), geolocation=()',
            },
          ],
        },
        // Production - Static assets with long-term caching
        {
          source: '/_next/static/(.*)',
          headers: [
            {
              key: 'Cache-Control',
              value: 'public, max-age=31536000, immutable',
            },
          ],
        },
        // Production - Next.js images with optimization caching
        {
          source: '/_next/image/(.*)',
          headers: [
            {
              key: 'Cache-Control',
              value: 'public, max-age=86400',
            },
          ],
        }
      ])
    ]
  },
}

export default nextConfig