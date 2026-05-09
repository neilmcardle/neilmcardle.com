import type { Metadata, Viewport } from 'next'
import { Fraunces, Inter } from 'next/font/google'
import { WeprayAuthProvider } from './hooks/useWeprayAuth'
import './wepray.css'

const fraunces = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-serif',
  axes: ['opsz', 'SOFT'],
})

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
})

const TITLE = 'WePray — pray together, for each other'
const DESCRIPTION = 'A small, private circle for shared prayer. Bring your friends and family in via invite, share what needs prayer, and tap a button when you do.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: 'https://neilmcardle.com/wepray' },
  robots: { index: false, follow: false },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#faf7f0',
}

export default function WeprayLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`wepray-root ${fraunces.variable} ${inter.variable}`}>
      <WeprayAuthProvider>
        {children}
      </WeprayAuthProvider>
    </div>
  )
}
