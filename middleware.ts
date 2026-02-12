import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const MAKEEBOOK_DOMAIN = 'makeebook.ink';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const { pathname } = request.nextUrl;

  // Handle makeebook.ink domain
  if (hostname.includes(MAKEEBOOK_DOMAIN)) {
    // API and auth routes pass through unchanged
    if (pathname.startsWith('/api/') || pathname.startsWith('/auth/')) {
      return NextResponse.next();
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

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except static files
    '/((?!_next/static|_next/image).*)',
  ],
};
