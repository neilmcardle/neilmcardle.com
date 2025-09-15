"use client"

import { usePathname } from 'next/navigation'
import { Footer } from './Footer'

export function ConditionalFooter() {
  const pathname = usePathname()
  
  // Don't show footer on homepage and vector-paint page
  const hideFooterOnPaths = ['/', '/vector-paint']
  
  if (hideFooterOnPaths.includes(pathname)) {
    return null
  }
  
  return <Footer />
}