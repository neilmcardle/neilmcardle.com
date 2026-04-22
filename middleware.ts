import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const MAKEEBOOK_DOMAIN = 'makeebook.ink';
const PORTFOLIO_COOKIE = 'nm-portfolio';

async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function portfolioExpectedToken(): Promise<string | null> {
  const pw = process.env.PORTFOLIO_PASSWORD;
  const secret = process.env.PORTFOLIO_COOKIE_SECRET;
  if (!pw || !secret) return null;
  return sha256Hex(pw + secret);
}

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const { pathname } = request.nextUrl;

  // Redirect www.makeebook.ink to makeebook.ink (SSL cert only covers apex domain)
  if (hostname === `www.${MAKEEBOOK_DOMAIN}`) {
    const url = request.nextUrl.clone();
    url.host = MAKEEBOOK_DOMAIN;
    return NextResponse.redirect(url, 301);
  }

  // Handle makeebook.ink domain
  if (hostname.includes(MAKEEBOOK_DOMAIN)) {
    // API and auth routes pass through unchanged
    if (pathname.startsWith('/api/') || pathname.startsWith('/auth/')) {
      return NextResponse.next();
    }

    // Sitemap and robots — rewrite to the make-ebook generators so they're
    // served at the apex (makeebook.ink/sitemap.xml, makeebook.ink/robots.txt).
    // Must run BEFORE the static-file short-circuit below.
    if (pathname === '/sitemap.xml' || pathname === '/robots.txt') {
      const url = request.nextUrl.clone();
      url.pathname = `/make-ebook${pathname}`;
      return NextResponse.rewrite(url);
    }

    // Static files and Next.js internals pass through
    if (
      pathname.startsWith('/_next/') ||
      pathname.startsWith('/favicon') ||
      pathname.includes('.')
    ) {
      return NextResponse.next();
    }

    // Already on /make-ebook path — pass through
    if (pathname.startsWith('/make-ebook')) {
      return NextResponse.next();
    }

    // Rewrite root and sub-paths to /make-ebook
    const url = request.nextUrl.clone();
    url.pathname = `/make-ebook${pathname === '/' ? '' : pathname}`;
    return NextResponse.rewrite(url);
  }

  // Handle neilmcardle.com — redirect /make-ebook to makeebook.ink
  // Skip static files (e.g. /make-ebook-logomark.svg) — only redirect route paths
  // Skip localhost so local dev works without redirecting
  if (pathname.startsWith('/make-ebook') && !pathname.includes('.') && !hostname.includes('localhost')) {
    const newPath = pathname.replace('/make-ebook', '') || '/';
    const search = request.nextUrl.search;
    return NextResponse.redirect(
      `https://${MAKEEBOOK_DOMAIN}${newPath}${search}`,
      301
    );
  }

  // Portfolio gate — /portfolio and everything under it is password-locked.
  // Authenticated visitors (valid nm-portfolio cookie) see the SPA; others
  // see the unlock form via a rewrite so the URL stays /portfolio.
  if (pathname === '/portfolio' || pathname.startsWith('/portfolio/')) {
    const expected = await portfolioExpectedToken();
    const cookie = request.cookies.get(PORTFOLIO_COOKIE)?.value;
    const authed = expected && cookie === expected;

    if (!authed) {
      // Block asset fetches before anyone is authenticated
      if (pathname.includes('.')) {
        return new NextResponse(null, { status: 404 });
      }
      const url = request.nextUrl.clone();
      url.pathname = '/portfolio-unlock';
      return NextResponse.rewrite(url);
    }

    // Authenticated — route SPA deep links (no file extension) to index.html
    if (!pathname.includes('.')) {
      const url = request.nextUrl.clone();
      url.pathname = '/portfolio/index.html';
      return NextResponse.rewrite(url);
    }
    // Asset request — serve static file as-is
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except static files
    '/((?!_next/static|_next/image).*)',
  ],
};
