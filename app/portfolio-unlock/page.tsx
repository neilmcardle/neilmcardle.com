// Password gate for /portfolio. Served by middleware when a visitor
// without a valid nm-portfolio cookie requests any /portfolio path —
// the browser URL stays /portfolio via rewrite, so this page only exists
// as a rewrite target, not a directly-linked route. noindex is belt-and-
// braces; robots.txt already disallows this path.

import PortfolioUnlockForm from "./PortfolioUnlockForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portfolio access | Neil McArdle",
  robots: { index: false, follow: false },
};

export default function PortfolioUnlockPage() {
  return (
    <main className="min-h-screen bg-[#faf9f5] flex items-center justify-center px-6 py-20">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 mb-3" style={{ letterSpacing: "-0.02em" }}>
            In-house portfolio
          </h1>
          <p className="text-gray-600" style={{ fontFamily: "Georgia, serif", lineHeight: 1.6 }}>
            Protected work for recruiters and hiring managers. Enter the password you were given.
          </p>
        </div>
        <PortfolioUnlockForm />
        <p className="mt-8 text-center text-xs text-gray-500">
          Neil McArdle <span className="mx-1.5 text-gray-300">|</span> Product Designer <span className="mx-1.5 text-gray-300">|</span> <a href="mailto:neil@neilmcardle.com" className="underline hover:text-gray-700 transition-colors">neil@neilmcardle.com</a>
        </p>
      </div>
    </main>
  );
}
