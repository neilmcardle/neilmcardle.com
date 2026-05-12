// Re-exports the generic Pro auth gate so existing Book Mind routes can keep
// importing `requireProUser` from here. New routes should import directly from
// `@/lib/auth/requirePro`.

export { requirePro as requireProUser } from '@/lib/auth/requirePro';
export type { ProAuthResult } from '@/lib/auth/requirePro';
