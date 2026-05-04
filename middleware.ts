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

  // Apex-only: redirect the www subdomain to the apex.
  if (hostname === `www.${MAKEEBOOK_DOMAIN}`) {
    const url = request.nextUrl.clone();
    url.host = MAKEEBOOK_DOMAIN;
    return NextResponse.redirect(url, 301);
  }

  if (hostname.includes(MAKEEBOOK_DOMAIN)) {
    if (pathname.startsWith('/api/') || pathname.startsWith('/auth/')) {
      return NextResponse.next();
    }

    // Rewrite sitemap and robots to the editor-product generators so they're
    // served at the apex. Must run BEFORE the static-file short-circuit below.
    if (pathname === '/sitemap.xml' || pathname === '/robots.txt') {
      const url = request.nextUrl.clone();
      url.pathname = `/make-ebook${pathname}`;
      return NextResponse.rewrite(url);
    }

    if (
      pathname.startsWith('/_next/') ||
      pathname.startsWith('/favicon') ||
      pathname.includes('.')
    ) {
      return NextResponse.next();
    }

    if (pathname.startsWith('/make-ebook')) {
      return NextResponse.next();
    }

    // Paid-search landing page lives at the top-level /start route, not under
    // /make-ebook. Bypass the host rewrite so makeebook.ink/start serves it.
    if (pathname === '/start' || pathname.startsWith('/start/')) {
      return NextResponse.next();
    }

    const url = request.nextUrl.clone();
    url.pathname = `/make-ebook${pathname === '/' ? '' : pathname}`;
    return NextResponse.rewrite(url);
  }

  // Redirect /make-ebook routes off the personal site to the editor product.
  // Skip static asset paths (those with a file extension) and localhost.
  if (pathname.startsWith('/make-ebook') && !pathname.includes('.') && !hostname.includes('localhost')) {
    const newPath = pathname.replace('/make-ebook', '') || '/';
    const search = request.nextUrl.search;
    return NextResponse.redirect(
      `https://${MAKEEBOOK_DOMAIN}${newPath}${search}`,
      301
    );
  }

  // Gated portfolio: rewrite to the unlock form when not authenticated.
  if (pathname === '/portfolio' || pathname.startsWith('/portfolio/')) {
    const expected = await portfolioExpectedToken();
    const cookie = request.cookies.get(PORTFOLIO_COOKIE)?.value;
    const authed = expected && cookie === expected;

    if (!authed) {
      // Block asset fetches before anyone is authenticated.
      if (pathname.includes('.')) {
        return new NextResponse(null, { status: 404 });
      }
      const url = request.nextUrl.clone();
      url.pathname = '/portfolio-unlock';
      return NextResponse.rewrite(url);
    }

    // Route SPA deep links to index.html.
    if (!pathname.includes('.')) {
      const url = request.nextUrl.clone();
      url.pathname = '/portfolio/index.html';
      return NextResponse.rewrite(url);
    }
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
