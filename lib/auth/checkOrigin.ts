// Cross-origin POST guard. SameSite=Lax cookies block most CSRF but not
// form/image-tag POSTs from other origins. Call this at the top of every
// mutating route that reads the Supabase auth cookie.

import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_ORIGINS = new Set([
  'https://makeebook.ink',
  'https://www.makeebook.ink',
  'https://neilmcardle.com',
  'https://www.neilmcardle.com',
  'http://localhost:3000',
]);

export function checkOrigin(req: NextRequest): NextResponse | null {
  const origin = req.headers.get('origin');
  if (!origin) return null;
  if (ALLOWED_ORIGINS.has(origin)) return null;
  return NextResponse.json({ error: 'Forbidden origin' }, { status: 403 });
}
