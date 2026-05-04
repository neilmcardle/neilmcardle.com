import type React from "react";
import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import "../styles/immersive.css";
import "../styles/vendor/draft-js.css";
import "../styles/vendor/google-fonts.css";
import { AuthProvider } from "@/lib/hooks/useAuth";
import { SubscriptionProvider } from "@/lib/hooks/useSubscription";
import { ThemeProvider } from "@/lib/contexts/ThemeContext";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import ClientFooterWrapper from "@/components/ClientFooterWrapper";
import NeilAgent from "@/components/NeilAgent";
import CookieConsent from "@/components/CookieConsent";
import { Analytics } from "@vercel/analytics/next";

const TITLE = "Neil McArdle · Product Designer";
const DESCRIPTION =
  "Product designer from the UK. I make complex tools feel effortless. Building makeEbook, Icon Animator and Promptr.";

export const metadata: Metadata = {
  metadataBase: new URL("https://neilmcardle.com"),
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: "https://neilmcardle.com",
  },
  generator: "",
  icons: {
    icon: [
      { url: "/n-favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/n-favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/n-favicon.ico",
    apple: "/n-apple-touch-icon.png",
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "https://neilmcardle.com",
    siteName: "Neil McArdle",
    type: "website",
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    creator: "@BetterNeil",
  },
};

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": "https://neilmcardle.com/#person",
  name: "Neil McArdle",
  url: "https://neilmcardle.com",
  jobTitle: "Product Designer",
  description: DESCRIPTION,
  email: "mailto:neil@neilmcardle.com",
  image: "https://neilmcardle.com/me.png",
  nationality: "British",
  sameAs: [
    "https://www.linkedin.com/in/neilmcardle/",
    "https://github.com/neilmcardle",
    "https://x.com/BetterNeil",
    "https://medium.com/@BetterNeil",
  ],
  knowsAbout: [
    "Product Design",
    "Software Design",
    "User Experience",
    "EPUB",
    "Self-Publishing",
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans" style={{ fontFamily: 'var(--font-inter)' }}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
        <AuthProvider>
          <SubscriptionProvider>
            <ThemeProvider>
              <div className="min-h-screen flex flex-col">
                <main className="flex-1">{children}</main>
                <ClientFooterWrapper />
              </div>
              <Toaster />
              <SonnerToaster />
            </ThemeProvider>
          </SubscriptionProvider>
        </AuthProvider>
        <NeilAgent />
        <CookieConsent />
        <Analytics />

        {/* Google Ads (gtag.js) with Consent Mode v2.
            All ad/analytics signals default to 'denied' for UK GDPR / PECR
            compliance — gtag loads, but no cookies are set and no
            attribution data is sent until the user grants consent through
            the cookie banner. The signup conversion itself is fired from
            useSignupConversion when ?signup=success is present.
            The future cookie banner should call setAdsConsent() from
            lib/consent.ts to flip these to 'granted' on user opt-in. */}
        <Script id="gtag-consent" strategy="beforeInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;
            gtag('consent', 'default', {
              ad_storage: 'denied',
              ad_user_data: 'denied',
              ad_personalization: 'denied',
              analytics_storage: 'denied',
              wait_for_update: 500
            });
          `}
        </Script>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-943391250"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            gtag('js', new Date());
            gtag('config', 'AW-943391250');
          `}
        </Script>
      </body>
    </html>
  );
}
