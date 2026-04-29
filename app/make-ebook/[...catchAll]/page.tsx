import { notFound } from 'next/navigation';

// Catch-all route under this segment. Resolves to the local not-found page.
export default function MakeEbookCatchAll() {
  notFound();
}
