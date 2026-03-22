"use client";

import { useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { Copy } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

const PortfolioEditorDemo = dynamic(
  () => import("@/components/PortfolioEditorDemo"),
  { ssr: false }
);

export default function Homepage() {
  const [copied, setCopied] = useState(false);
  const email = "neil@neilmcardle.com";

  const handleCopy = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#faf9f7] dark:bg-[#0f0f0f] transition-colors">

      {/* Header */}
      <header className="flex items-center justify-between px-8 sm:px-16 lg:px-24 pt-8 pb-0 max-w-[1100px] mx-auto">
        <Image
          src="/neil-mcardle-logomark.svg"
          alt="Neil McArdle"
          width={26}
          height={26}
          className="dark:invert opacity-50 hover:opacity-100 transition-opacity duration-300"
          style={{ color: "transparent" }}
        />
        <ThemeToggle />
      </header>

      <main className="px-8 sm:px-16 lg:px-24 max-w-[1100px] mx-auto pb-32">

        {/* ── Hero ──────────────────────────────────────────── */}
        <section className="pt-16 pb-24">
          <h1
            className="text-[68px] sm:text-[88px] lg:text-[108px] text-black dark:text-white mb-8 leading-[0.92]"
            style={{
              fontFamily: "var(--font-playfair)",
              fontWeight: 400,
              letterSpacing: "-0.03em",
            }}
          >
            Neil<br />McArdle
          </h1>

          <p
            className="text-xl sm:text-2xl mb-5 leading-snug max-w-[500px] text-black/70 dark:text-white/65"
            style={{
              fontFamily: "var(--font-inter)",
              fontWeight: 300,
            }}
          >
            I make complex tools<br />feel effortless.
          </p>

          <div className="flex items-center gap-6">
            <p
              className="text-sm text-black/30 dark:text-white/25 tracking-wide"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Product designer · Builder · UK
            </p>
            <a
              href={`mailto:${email}`}
              className="text-sm text-black/40 dark:text-white/35 hover:text-black dark:hover:text-white transition-colors duration-200"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Available for projects →
            </a>
          </div>
        </section>

        {/* ── Divider ───────────────────────────────────────── */}
        <div className="w-full h-px bg-black/[0.08] dark:bg-white/[0.08] mb-20" />

        {/* ── Work: makeEbook ───────────────────────────────── */}
        <section className="mb-24">

          {/* Project label row */}
          <div className="flex items-end justify-between mb-8">
            <div className="flex items-end gap-5">
              <span
                className="text-[11px] font-medium uppercase tracking-[0.2em] text-black/25 dark:text-white/20 pb-1"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                01
              </span>
              <h2
                className="text-3xl sm:text-4xl text-black dark:text-white leading-none"
                style={{
                  fontFamily: "var(--font-playfair)",
                  fontWeight: 400,
                  letterSpacing: "-0.02em",
                }}
              >
                makeEbook
              </h2>
            </div>
            <a
              href="https://makeebook.ink"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-black/35 dark:text-white/30 hover:text-black dark:hover:text-white transition-colors duration-200 pb-1"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              makeebook.ink
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 17L17 7M7 7h10v10" />
              </svg>
            </a>
          </div>

          {/* Interactive editor demo */}
          <PortfolioEditorDemo />

          {/* Project meta */}
          <div className="mt-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <p
              className="text-sm text-black/50 dark:text-white/40 max-w-[480px] leading-relaxed"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              A free, browser-based eBook editor. Write, format and export a professional
              EPUB ready for Kindle, Kobo and Apple Books. No install needed.
            </p>
            <p
              className="text-[11px] uppercase tracking-[0.15em] text-black/25 dark:text-white/20 whitespace-nowrap pt-0.5"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Design · Development
            </p>
          </div>
        </section>

        {/* ── Divider ───────────────────────────────────────── */}
        <div className="w-full h-px bg-black/[0.08] dark:bg-white/[0.08] mb-20" />

        {/* ── About + Contact ───────────────────────────────── */}
        <section className="flex flex-col sm:flex-row sm:justify-between gap-12">

          {/* About */}
          <div className="max-w-[380px]">
            <p
              className="text-sm text-black/55 dark:text-white/45 leading-relaxed"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              By day I design in mobility — rental experiences, booking flows, fleet listings.
              By night I build tools I wish existed.
            </p>
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-2">
              <span
                className="text-sm text-black/55 dark:text-white/45"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                {email}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="p-1 rounded transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                aria-label="Copy email"
              >
                {copied ? (
                  <span className="text-xs text-green-600 dark:text-green-400" style={{ fontFamily: "var(--font-inter)" }}>
                    Copied
                  </span>
                ) : (
                  <Copy className="w-3.5 h-3.5 text-black/25 dark:text-white/20" />
                )}
              </button>
            </div>

            <div className="flex items-center gap-5">
              <a
                href="https://github.com/neilmcardle"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-black/40 dark:text-white/35 hover:text-black dark:hover:text-white transition-colors duration-200"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                GitHub
              </a>
              <a
                href="https://x.com/BetterNeil"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-black/40 dark:text-white/35 hover:text-black dark:hover:text-white transition-colors duration-200"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                X / Twitter
              </a>
            </div>
          </div>
        </section>

      </main>

    </div>
  );
}
