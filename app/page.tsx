"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Copy } from "lucide-react";

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
    <div className="min-h-screen bg-[#0a0a0a]">

      {/* Header */}
      <header className="px-8 sm:px-16 lg:px-24 pt-8 pb-0 max-w-[1100px] mx-auto">
        <Image
          src="/dark-neil-mcardle-logomark.svg"
          alt="Neil McArdle"
          width={26}
          height={26}
          className="opacity-50 hover:opacity-100 transition-opacity duration-300"
          style={{ color: "transparent" }}
        />
      </header>

      <main className="px-8 sm:px-16 lg:px-24 max-w-[1100px] mx-auto pb-32">

        {/* ── Hero ──────────────────────────────────────────── */}
        <section className="pt-16 pb-24">
          <div
            className="mb-8 overflow-hidden rounded-full"
            style={{
              width: 96,
              height: 96,
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            <Image
              src="/me.png"
              alt="Neil McArdle"
              width={96}
              height={96}
              className="w-full h-full object-cover"
            />
          </div>

          <h1
            className="text-[68px] sm:text-[88px] lg:text-[108px] text-white mb-8 leading-[0.92]"
            style={{
              fontFamily: "var(--font-playfair)",
              fontWeight: 400,
              letterSpacing: "-0.03em",
            }}
          >
            Neil<br />McArdle
          </h1>

          <p
            className="text-xl sm:text-2xl mb-5 leading-snug max-w-[500px] text-white/80"
            style={{
              fontFamily: "var(--font-inter)",
              fontWeight: 300,
            }}
          >
            I make complex tools feel effortless.
          </p>

          <div className="flex items-center gap-6">
            <p
              className="text-sm text-white/50 tracking-wide"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Product designer · UK
            </p>
            <a
              href="https://www.cal.eu/neilmca"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-white/55 hover:text-white transition-colors duration-200"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Available for projects, book a call →
            </a>
          </div>
        </section>

        {/* ── Divider ───────────────────────────────────────── */}
        <div className="w-full h-px bg-white/[0.08] mb-20" />

        {/* ── Work: makeEbook ───────────────────────────────── */}
        <section className="mb-24">

          {/* Project label row */}
          <div className="flex items-end justify-between mb-8">
            <div className="flex items-end gap-5">
              <span
                className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/45 pb-1"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                01
              </span>
              <h2
                className="text-3xl sm:text-4xl text-white leading-none"
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
              className="flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors duration-200 pb-1"
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
              className="text-sm text-white/60 max-w-[480px] leading-relaxed"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              A browser-based editor for self-published books. Bring your manuscript
              from anywhere, polish it with AI editorial feedback, and export a
              store-ready EPUB for Kindle, Kobo and Apple Books.
            </p>
            <p
              className="text-[11px] uppercase tracking-[0.15em] text-white/45 whitespace-nowrap pt-0.5"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Design · Development
            </p>
          </div>
        </section>

        {/* ── Divider ───────────────────────────────────────── */}
        <div className="w-full h-px bg-white/[0.08] mb-20" />

        {/* ── Work: Icon Animator ───────────────────────────── */}
        <section className="mb-24">
          <div className="flex items-end justify-between mb-8">
            <div className="flex items-end gap-5">
              <span
                className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/45 pb-1"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                02
              </span>
              <h2
                className="text-3xl sm:text-4xl text-white leading-none"
                style={{ fontFamily: "var(--font-playfair)", fontWeight: 400, letterSpacing: "-0.02em" }}
              >
                Icon Animator
              </h2>
            </div>
            <Link
              href="/icon-animator"
              className="flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors duration-200 pb-1"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Try it
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 17L17 7M7 7h10v10" />
              </svg>
            </Link>
          </div>

          {/* Animated preview */}
          <div
            className="w-full rounded-2xl flex items-center justify-center gap-10 sm:gap-16 bg-[#111]"
            style={{ height: 260, boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)" }}
          >
            {[
              { d: <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />, anim: "animate-bounce",   delay: "100ms"   },
              { d: <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />, anim: "animate-bounce", delay: "200ms" },
              { d: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />, anim: "animate-bounce",  delay: "300ms"   },
              { d: <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></>, anim: "animate-bounce", delay: "400ms" },
              { d: <><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></>, anim: "animate-bounce", delay: "500ms" },
            ].map((item, i) => (
              <svg
                key={i}
                viewBox="0 0 24 24"
                fill="none"
                className={`w-8 h-8 stroke-white/70 ${item.anim}`}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ animationDelay: item.delay }}
              >
                {item.d}
              </svg>
            ))}
          </div>

          <div className="mt-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <p
              className="text-sm text-white/60 max-w-[480px] leading-relaxed"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Pick an SVG icon, choose an animation preset, tune the timing and copy the CSS. No install needed.
            </p>
            <p
              className="text-[11px] uppercase tracking-[0.15em] text-white/45 whitespace-nowrap pt-0.5"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Design · Development
            </p>
          </div>
        </section>

        {/* ── Divider ───────────────────────────────────────── */}
        <div className="w-full h-px bg-white/[0.08] mb-20" />

        {/* ── Work: Promptr ─────────────────────────────────── */}
        <section className="mb-24">
          <div className="flex items-end justify-between mb-8">
            <div className="flex items-end gap-5">
              <span
                className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/45 pb-1"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                03
              </span>
              <h2
                className="text-3xl sm:text-4xl text-white leading-none"
                style={{ fontFamily: "var(--font-playfair)", fontWeight: 400, letterSpacing: "-0.02em" }}
              >
                Promptr
              </h2>
            </div>
            <Link
              href="/promptr"
              className="flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors duration-200 pb-1"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Try it
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 17L17 7M7 7h10v10" />
              </svg>
            </Link>
          </div>

          {/* Preview mirrors the real Promptr page: Zilla Slab wordmark +
              italic Playfair tagline + blacksmith illustration as a magazine
              lockup, then the live scorecard the tool actually shows. */}
          <div
            className="w-full rounded-2xl bg-[#111] p-8 sm:p-14"
            style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)" }}
          >
            <div className="max-w-[500px] mx-auto flex flex-col">
              <div className="flex items-center gap-6 sm:gap-10 mb-10 sm:mb-12">
                <div className="flex-1 min-w-0">
                  <div
                    className="text-white/90"
                    style={{
                      fontFamily: "var(--font-zilla-slab)",
                      fontWeight: 700,
                      fontSize: "clamp(44px, 7vw, 68px)",
                      lineHeight: 0.9,
                      letterSpacing: "-0.03em",
                    }}
                  >
                    Promptr
                  </div>
                  <div
                    className="mt-2 text-white/55"
                    style={{
                      fontFamily: "var(--font-playfair)",
                      fontStyle: "italic",
                      fontSize: "clamp(15px, 2vw, 19px)",
                      lineHeight: 1.25,
                      letterSpacing: "-0.015em",
                    }}
                  >
                    Your prompt workshop.
                  </div>
                </div>
                <div className="flex-shrink-0 w-[108px] sm:w-[140px]">
                  <Image
                    src="/promptr.png"
                    alt="A blacksmith hammering a blade on an anvil, sparks flying"
                    width={280}
                    height={420}
                    className="w-full h-auto block rounded-[10px]"
                    style={{
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  />
                </div>
              </div>

              <div className="h-px bg-white/[0.08] mb-8 sm:mb-10" />

              <div className="flex flex-col gap-4">
                {[
                  { label: "Clarity",        score: 4 },
                  { label: "Specificity",    score: 2 },
                  { label: "Role & Context", score: 3 },
                  { label: "Constraints",    score: 4 },
                  { label: "Output format",  score: 5 },
                  { label: "Examples",       score: 5 },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between">
                    <span
                      className="text-sm text-white/70"
                      style={{ fontFamily: "var(--font-inter)" }}
                    >
                      {row.label}
                    </span>
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <span
                            key={i}
                            className={`w-2 h-2 rounded-full ${
                              i <= row.score
                                ? "bg-white/85"
                                : "bg-white/15"
                            }`}
                          />
                        ))}
                      </div>
                      <span
                        className="text-xs text-white/50 tabular-nums"
                        style={{ fontFamily: "var(--font-inter)", minWidth: 24, textAlign: "right" }}
                      >
                        {row.score}/5
                      </span>
                    </div>
                  </div>
                ))}
                <div className="mt-3 pt-4 border-t border-white/[0.1] flex items-baseline justify-between gap-4">
                  <span
                    className="text-lg text-white/85"
                    style={{ fontFamily: "var(--font-playfair)", letterSpacing: "-0.01em" }}
                  >
                    Tight and actionable. A good draft.
                  </span>
                  <span
                    className="text-xs text-white/55 tabular-nums whitespace-nowrap"
                    style={{ fontFamily: "var(--font-inter)" }}
                  >
                    23/30 · Strong
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <p
              className="text-sm text-white/60 max-w-[480px] leading-relaxed"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              A workshop for your first draft. Paste a prompt, score it against a rubric, refine it, and learn what actually makes one work.
            </p>
            <p
              className="text-[11px] uppercase tracking-[0.15em] text-white/45 whitespace-nowrap pt-0.5"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Design · Development · AI
            </p>
          </div>
        </section>

        {/* ── Divider ───────────────────────────────────────── */}
        <div className="w-full h-px bg-white/[0.08] mb-20" />

        {/* ── About + Contact ───────────────────────────────── */}
        <section className="flex flex-col sm:flex-row sm:justify-between gap-12">

          {/* About */}
          <div className="max-w-[380px]">
            <p
              className="text-sm text-white/65 leading-relaxed"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Product designer in the UK. By day, I work on mobility products.
              Rental flows, booking experiences, fleet listings. By night, I build
              the tools I wish existed. Every product on this page is mine, end to end.
            </p>
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-2">
              <span
                className="text-sm text-white/65"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                {email}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="p-1 rounded transition-colors hover:bg-white/5"
                aria-label="Copy email"
              >
                {copied ? (
                  <span className="text-xs text-green-400" style={{ fontFamily: "var(--font-inter)" }}>
                    Copied
                  </span>
                ) : (
                  <Copy className="w-3.5 h-3.5 text-white/40" />
                )}
              </button>
            </div>

            <div className="flex items-center gap-5">
              <a
                href="https://www.linkedin.com/in/neilmcardle/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-white/55 hover:text-white transition-colors duration-200"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                LinkedIn
              </a>
              <a
                href="https://github.com/neilmcardle"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-white/55 hover:text-white transition-colors duration-200"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                GitHub
              </a>
              <a
                href="https://x.com/BetterNeil"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-white/55 hover:text-white transition-colors duration-200"
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
