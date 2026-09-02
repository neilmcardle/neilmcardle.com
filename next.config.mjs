const isDev = process.env.NODE_ENV === "development";

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true, // Temporarily ignore for project setup
  },
  turbopack: {},

  devIndicators: {
    position: "bottom-right",
  },

  serverExternalPackages: ["@resvg/resvg-js", "@react-pdf/renderer"],

  webpack: (config, { isServer }) => {
    config.resolve.alias.canvas = false;

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
  async rewrites() {
    return [
      { source: "/kids-alphabet", destination: "/kids-alphabet/index.html" },
      { source: "/kids-alphabet/", destination: "/kids-alphabet/index.html" },
    ];
  },
  async redirects() {
    return [
      {
        source: "/make-ebook/book-mind",
        destination: "/make-ebook",
        permanent: true,
      },
      {
        source: "/make-ebook/book-mind/:path*",
        destination: "/make-ebook",
        permanent: true,
      },

      {
        source: "/wireframe",
        destination: "/doodlewire",
        permanent: true,
      },
      {
        source: "/wireframe/:path*",
        destination: "/doodlewire/:path*",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      ...(isDev
        ? [
            {
              source: "/(.*)",
              headers: [
                {
                  key: "Cache-Control",
                  value: "no-cache, no-store, must-revalidate",
                },
              ],
            },
          ]
        : [
            {
              source: "/((?!_next/static|_next/image|favicon.ico).*)",
              headers: [
                {
                  key: "Content-Security-Policy",
                  value:
                    "default-src 'self'; " +
                    "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://unpkg.com https://cdn.jsdelivr.net https://www.googletagmanager.com; " +
                    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
                    "img-src 'self' data: blob: https:; " +
                    "font-src 'self' data: https://fonts.gstatic.com; " +
                    "media-src 'self' blob: https://*.mux.com https://*.elevenlabs.io; " +
                    "connect-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com https://firebase.googleapis.com https://firestore.googleapis.com https://hhsiuvalashrqtpluxan.supabase.co https://agisftsuzxiwctupgeol.supabase.co https://lbwlsmxfmkjhugrdwtqn.supabase.co https://api.x.ai https://*.mux.com https://inferred.litix.io https://api.elevenlabs.io https://api.us.elevenlabs.io wss://api.elevenlabs.io wss://api.us.elevenlabs.io https://www.googletagmanager.com https://www.google-analytics.com https://www.google.com https://www.google.co.uk https://googleads.g.doubleclick.net https://stats.g.doubleclick.net; " +
                    "worker-src 'self' blob:; " +
                    "frame-ancestors 'none';",
                },
                {
                  key: "Cache-Control",
                  value: "private, max-age=0, must-revalidate",
                },
                {
                  key: "X-Frame-Options",
                  value: "DENY",
                },
                {
                  key: "X-Content-Type-Options",
                  value: "nosniff",
                },
                {
                  key: "Referrer-Policy",
                  value: "strict-origin-when-cross-origin",
                },
                {
                  key: "Permissions-Policy",
                  value: "camera=(), microphone=(self), geolocation=()",
                },
              ],
            },

            {
              source: "/_next/static/(.*)",
              headers: [
                {
                  key: "Cache-Control",
                  value: "public, max-age=31536000, immutable",
                },
              ],
            },

            {
              source: "/_next/image/(.*)",
              headers: [
                {
                  key: "Cache-Control",
                  value: "public, max-age=86400",
                },
              ],
            },
          ]),
    ];
  },
};

export default nextConfig;
