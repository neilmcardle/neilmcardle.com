import type { Metadata } from 'next'
import { Nunito, Inter } from 'next/font/google'

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-ka-display',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-ka-body',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Kids Academy — Neil McArdle',
  description:
    'Interactive learning experiences mapped to the UK National Curriculum. A soft-launch pilot, free to use.',
  alternates: {
    canonical: 'https://neilmcardle.com/kids-academy',
  },
  robots: { index: false, follow: false },
}

export default function KidsAcademyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${nunito.variable} ${inter.variable} font-ka-body bg-white text-slate-900 min-h-screen`}>
      {children}
    </div>
  )
}
