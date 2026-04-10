import { notFound } from 'next/navigation';

// Catches any URL under /make-ebook/* that isn't matched by a more specific
// route. Calling notFound() here resolves to app/make-ebook/not-found.tsx
// (the brand-voice 404) instead of falling through to the root not-found.
//
// Next.js routes more specific paths before catch-all, so /blog, /signin,
// /book-mind, /blog/[slug], etc. all take precedence and never hit this file.
export default function MakeEbookCatchAll() {
  notFound();
}
