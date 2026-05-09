'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV: { href: string; label: string; match: (p: string) => boolean }[] = [
  { href: '/wepray/home',    label: 'Home',    match: p => p.startsWith('/wepray/home') },
  { href: '/wepray/circles', label: 'Circles', match: p => p.startsWith('/wepray/circles') },
  { href: '/wepray/bible',   label: 'Bible',   match: p => p.startsWith('/wepray/bible') },
  { href: '/wepray/me',      label: 'Me',      match: p => p.startsWith('/wepray/me') },
]

// Auth gate temporarily removed — anyone can browse /wepray/* while we
// look around the app. Restore the redirect when wiring real Supabase.
export default function WeprayAppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? ''

  return (
    <>
      <main style={{ maxWidth: 720, margin: '0 auto', padding: '1.25rem 1rem 6rem' }}>
        {children}
      </main>
      <nav className="wp-bottom-nav" aria-label="Primary">
        {NAV.map(n => (
          <Link key={n.href} href={n.href} data-active={n.match(pathname)}>
            {n.label}
          </Link>
        ))}
      </nav>
    </>
  )
}
