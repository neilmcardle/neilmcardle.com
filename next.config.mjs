/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV === 'development';

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true, // Temporarily ignore for project setup
  },
  images: {
    unoptimized: true, // Keep unoptimized for now until external domains are audited
  },
  // Next.js 16 uses Turbopack by default - empty config acknowledges this
  turbopack: {},
  // Exclude pdfjs-dist from webpack bundling to avoid CSS issues (legacy webpack builds)
  webpack: (config, { isServer }) => {
    // Ignore pdfjs-dist CSS imports that cause issues
    config.resolve.alias.canvas = false;

    // Handle pdfjs-dist worker issues
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
        fs: false,
        path: false,
      };
    }

    return config;
  },
  async headers() {
    return [
      // Development - disable all caching
      ...(isDev
        ? [
            {
              source: '/(.*)',
              headers: [
                {
                  key: 'Cache-Control',
                  value: 'no-cache, no-store, must-revalidate',
                },
              ],
            },
          ]
        : [
            // Production - HTML/API routes with no caching and CSP
            {
              source: '/((?!_next/static|_next/image|favicon.ico).*)',
              headers: [
                {
                  key: 'Content-Security-Policy',
                  value:
                    "default-src 'self'; " +
                    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
                    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
                    "img-src 'self' data: blob: https:; " +
                    "font-src 'self' data: https://fonts.gstatic.com; " +
                    "media-src 'self' https://stream.mux.com; " +
                    "connect-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com https://firebase.googleapis.com https://firestore.googleapis.com https://hhsiuvalashrqtpluxan.supabase.co https://agisftsuzxiwctupgeol.supabase.co https://api.x.ai https://stream.mux.com https://inferred.litix.io; " +
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
            },
          ]),
    ];
  },
};

export default nextConfig;