"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Copy } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

const PRODUCTS = [
  {
    name: "makeEbook",
    icon: "/make-ebook-logo.svg",
    href: "https://makeebook.ink",
    external: true,
    wordmark: false,
  },
  {
    name: "Coverly",
    icon: "/coverly-logomark.svg",
    href: "https://coverly.figma.site/",
    external: true,
    wordmark: false,
  },
  {
    name: "Icon Animator",
    icon: "/sun-icon.svg",
    href: "/icon-animator",
    external: false,
    wordmark: false,
  },
  {
    name: "Promptr",
    icon: "/pencil-icon.svg",
    href: "/promptr",
    external: false,
    wordmark: false,
  },
];

function SelectedWork() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

return (
    <div ref={ref} className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        className="flex items-center gap-2 px-4 py-2 rounded-full border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-black/5 dark:hover:bg-white/10 transition-colors duration-200 shadow-sm"
        style={{ fontFamily: "var(--font-inter)" }}
      >
        <svg className="palette-icon w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={open ? { filter: 'grayscale(0) opacity(1)', transform: 'rotate(360deg) scale(1.25)' } : undefined}>
          <path d="M12 3C7.03 3 3 7.03 3 12s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8z" fill="#f5deb3"/>
          <circle cx="7" cy="12" r="1.4" fill="#ef4444"/>
          <circle cx="8.5" cy="8.5" r="1.4" fill="#f97316"/>
          <circle cx="12" cy="7.5" r="1.4" fill="#eab308"/>
          <circle cx="15.5" cy="8.5" r="1.4" fill="#22c55e"/>
          <circle cx="17" cy="12" r="1.4" fill="#3b82f6"/>
        </svg>
        <span className="text-sm text-black/60 dark:text-white/55">Selected work</span>
      </button>

      {open && (
        <div className="absolute left-1/2 -translate-x-1/2 top-full pt-2 z-50">
        <div className="w-52 rounded-2xl bg-white dark:bg-[#1a1a1a] border border-black/[0.06] dark:border-white/[0.06] shadow-xl overflow-hidden py-2">
          {PRODUCTS.map((p) => {
            const externalIcon = p.external ? (
              <svg className="w-3 h-3 text-black/25 dark:text-white/30 flex-shrink-0 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 17L17 7M7 7h10v10" />
              </svg>
            ) : null;
            const inner = p.wordmark ? (
              <>
                <Image src={p.icon} alt={p.name} width={96} height={20} className="h-5 w-auto dark:invert" />
                {externalIcon}
              </>
            ) : (
              <>
                <span className="w-8 h-8 rounded-lg bg-black/[0.04] dark:bg-white/[0.06] flex items-center justify-center flex-shrink-0">
                  <Image src={p.icon} alt={p.name} width={20} height={20} className="dark:invert" />
                </span>
                <span className="text-sm text-black/75 dark:text-white/70">{p.name}</span>
                {externalIcon}
              </>
            );
            return p.external ? (
              <a
                key={p.name}
                href={p.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-black/[0.04] dark:hover:bg-white/[0.05] transition-colors duration-150"
              >
                {inner}
              </a>
            ) : (
              <Link
                key={p.name}
                href={p.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-black/[0.04] dark:hover:bg-white/[0.05] transition-colors duration-150"
              >
                {inner}
              </Link>
            );
          })}
        </div>
        </div>
      )}
    </div>
  );
}

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
      <header className="grid grid-cols-3 items-center px-8 sm:px-16 lg:px-24 pt-8 pb-0 max-w-[1100px] mx-auto">
        <Image
          src="/neil-mcardle-logomark.svg"
          alt="Neil McArdle"
          width={26}
          height={26}
          className="dark:invert opacity-50 hover:opacity-100 transition-opacity duration-300"
          style={{ color: "transparent" }}
        />
        <div className="flex justify-center">
          <SelectedWork />
        </div>
        <div className="flex justify-end">
          <ThemeToggle />
        </div>
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
            className="text-xl sm:text-2xl mb-5 leading-snug max-w-[500px] text-black/70 dark:text-white/80"
            style={{
              fontFamily: "var(--font-inter)",
              fontWeight: 300,
            }}
          >
            I make complex tools feel effortless.
          </p>

          <div className="flex items-center gap-6">
            <p
              className="text-sm text-black/30 dark:text-white/50 tracking-wide"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Software designer · UK
            </p>
            <a
              href={`mailto:${email}`}
              className="text-sm text-black/40 dark:text-white/55 hover:text-black dark:hover:text-white transition-colors duration-200"
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
                className="text-[11px] font-medium uppercase tracking-[0.2em] text-black/25 dark:text-white/45 pb-1"
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
              className="flex items-center gap-1.5 text-sm text-black/35 dark:text-white/50 hover:text-black dark:hover:text-white transition-colors duration-200 pb-1"
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
              className="text-sm text-black/50 dark:text-white/60 max-w-[480px] leading-relaxed"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              A free, browser-based eBook editor. Write, format and export a professional
              EPUB ready for Kindle, Kobo and Apple Books. No install needed.
            </p>
            <p
              className="text-[11px] uppercase tracking-[0.15em] text-black/25 dark:text-white/45 whitespace-nowrap pt-0.5"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Design · Development
            </p>
          </div>
        </section>

        {/* ── Divider ───────────────────────────────────────── */}
        <div className="w-full h-px bg-black/[0.08] dark:bg-white/[0.08] mb-20" />

        {/* ── Work: Coverly ─────────────────────────────────── */}
        <section className="mb-24">

          {/* Project label row */}
          <div className="flex items-end justify-between mb-8">
            <div className="flex items-end gap-5">
              <span
                className="text-[11px] font-medium uppercase tracking-[0.2em] text-black/25 dark:text-white/45 pb-1"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                02
              </span>
              <h2
                className="text-3xl sm:text-4xl text-black dark:text-white leading-none"
                style={{
                  fontFamily: "var(--font-playfair)",
                  fontWeight: 400,
                  letterSpacing: "-0.02em",
                }}
              >
                Coverly
              </h2>
            </div>
            <a
              href="https://coverly.figma.site/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-black/35 dark:text-white/50 hover:text-black dark:hover:text-white transition-colors duration-200 pb-1"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              coverly.figma.site
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 17L17 7M7 7h10v10" />
              </svg>
            </a>
          </div>

          {/* Product image */}
          <div className="w-full rounded-2xl overflow-hidden bg-black/[0.03] dark:bg-white/[0.03]">
            <Image
              src="/coverly-product.png"
              alt="Coverly, book cover design tool"
              width={1920}
              height={1200}
              className="w-full h-auto"
            />
          </div>

          {/* Project meta */}
          <div className="mt-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <p
              className="text-sm text-black/50 dark:text-white/60 max-w-[480px] leading-relaxed"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              A book cover design tool built for authors. Create stunning covers with
              professional templates, no design experience needed.
            </p>
            <p
              className="text-[11px] uppercase tracking-[0.15em] text-black/25 dark:text-white/45 whitespace-nowrap pt-0.5"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Design · Development
            </p>
          </div>
        </section>

        {/* ── Divider ───────────────────────────────────────── */}
        <div className="w-full h-px bg-black/[0.08] dark:bg-white/[0.08] mb-20" />

        {/* ── Work: Icon Animator ───────────────────────────── */}
        <section className="mb-24">
          <div className="flex items-end justify-between mb-8">
            <div className="flex items-end gap-5">
              <span
                className="text-[11px] font-medium uppercase tracking-[0.2em] text-black/25 dark:text-white/45 pb-1"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                03
              </span>
              <h2
                className="text-3xl sm:text-4xl text-black dark:text-white leading-none"
                style={{ fontFamily: "var(--font-playfair)", fontWeight: 400, letterSpacing: "-0.02em" }}
              >
                Icon Animator
              </h2>
            </div>
            <Link
              href="/icon-animator"
              className="flex items-center gap-1.5 text-sm text-black/35 dark:text-white/50 hover:text-black dark:hover:text-white transition-colors duration-200 pb-1"
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
            className="w-full rounded-2xl flex items-center justify-center gap-10 sm:gap-16 bg-[#f8f8f7] dark:bg-[#111]"
            style={{ height: 260, boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.06)" }}
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
                className={`w-8 h-8 stroke-black/50 dark:stroke-white/70 ${item.anim}`}
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
              className="text-sm text-black/50 dark:text-white/60 max-w-[480px] leading-relaxed"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Pick an SVG icon, choose an animation preset, tune the timing and copy the CSS. No install needed.
            </p>
            <p
              className="text-[11px] uppercase tracking-[0.15em] text-black/25 dark:text-white/45 whitespace-nowrap pt-0.5"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Design · Development
            </p>
          </div>
        </section>

        {/* ── Divider ───────────────────────────────────────── */}
        <div className="w-full h-px bg-black/[0.08] dark:bg-white/[0.08] mb-20" />

        {/* ── Work: Promptr ─────────────────────────────────── */}
        <section className="mb-24">
          <div className="flex items-end justify-between mb-8">
            <div className="flex items-end gap-5">
              <span
                className="text-[11px] font-medium uppercase tracking-[0.2em] text-black/25 dark:text-white/45 pb-1"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                04
              </span>
              <h2
                className="text-3xl sm:text-4xl text-black dark:text-white leading-none"
                style={{ fontFamily: "var(--font-playfair)", fontWeight: 400, letterSpacing: "-0.02em" }}
              >
                Promptr
              </h2>
            </div>
            <Link
              href="/promptr"
              className="flex items-center gap-1.5 text-sm text-black/35 dark:text-white/50 hover:text-black dark:hover:text-white transition-colors duration-200 pb-1"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Try it
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 17L17 7M7 7h10v10" />
              </svg>
            </Link>
          </div>

          {/* Live scorecard preview — renders the same dots + labels the
              real tool uses, so the showcase is authentic to what the
              user will see when they click through. No image asset. */}
          <div
            className="w-full rounded-2xl bg-[#f8f8f7] dark:bg-[#111] p-8 sm:p-14"
            style={{ boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.06)" }}
          >
            <div className="max-w-[440px] mx-auto flex flex-col gap-4">
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
                    className="text-sm text-black/65 dark:text-white/65"
                    style={{ fontFamily: "var(--font-inter)" }}
                  >
                    {row.label}
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <span
                          key={i}
                          className="w-2 h-2 rounded-full"
                          style={{
                            background: i <= row.score
                              ? "rgba(0,0,0,0.78)"
                              : "rgba(0,0,0,0.12)",
                          }}
                        />
                      ))}
                    </div>
                    <span
                      className="text-xs text-black/40 dark:text-white/45 tabular-nums"
                      style={{ fontFamily: "var(--font-inter)", minWidth: 24, textAlign: "right" }}
                    >
                      {row.score}/5
                    </span>
                  </div>
                </div>
              ))}
              <div className="mt-3 pt-4 border-t border-black/[0.08] dark:border-white/[0.08] flex items-baseline justify-between gap-4">
                <span
                  className="text-lg text-black/75 dark:text-white/80"
                  style={{ fontFamily: "var(--font-playfair)", letterSpacing: "-0.01em" }}
                >
                  Tight and actionable. A good draft.
                </span>
                <span
                  className="text-xs text-black/40 dark:text-white/45 tabular-nums whitespace-nowrap"
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  23/30 · Strong
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <p
              className="text-sm text-black/50 dark:text-white/60 max-w-[480px] leading-relaxed"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              A workshop for your first draft. Paste a prompt, score it against a rubric, refine it, and learn what actually makes one work.
            </p>
            <p
              className="text-[11px] uppercase tracking-[0.15em] text-black/25 dark:text-white/45 whitespace-nowrap pt-0.5"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Design · Development · AI
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
              className="text-sm text-black/55 dark:text-white/65 leading-relaxed"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              By day I design in mobility, rental experiences, booking flows, fleet listings.
              By night I build tools I wish existed.
            </p>
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-2">
              <span
                className="text-sm text-black/55 dark:text-white/65"
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
                  <Copy className="w-3.5 h-3.5 text-black/25 dark:text-white/40" />
                )}
              </button>
            </div>

            <div className="flex items-center gap-5">
              <a
                href="https://github.com/neilmcardle"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-black/40 dark:text-white/55 hover:text-black dark:hover:text-white transition-colors duration-200"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                GitHub
              </a>
              <a
                href="https://x.com/BetterNeil"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-black/40 dark:text-white/55 hover:text-black dark:hover:text-white transition-colors duration-200"
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
