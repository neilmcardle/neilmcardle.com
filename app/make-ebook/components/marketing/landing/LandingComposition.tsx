"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

import { openCookieConsent } from "@/components/CookieConsent";

import { SECTION_TIERS } from "../sectionTiers";
import AboutNeilSection from "./AboutNeilSection";
import ComparisonSection from "./ComparisonSection";
import FaqSection from "./FaqSection";
import { BODY, EYEBROW, SHELL } from "./tokens";
import {
  ChapterListVisual,
  CoversVisual,
  ExportVisual,
  PreflightVisual,
  PrivacyVisual,
  ReaderSpreadVisual,
  RewriteVisual,
} from "./visuals";

type Row = {
  eyebrow: string;
  title: string;
  body: string;
  visual: React.ReactNode;
};

const ROWS: Row[] = [
  {
    eyebrow: "Chapters",
    title: "Every chapter, in one place",
    body: "Paste a manuscript and it splits into chapters you can reorder, rename, lock, and mark complete. Word counts update as you write, so you always know how far there is left to go.",
    visual: <ChapterListVisual />,
  },
  {
    eyebrow: "Pre-flight",
    title: "Ships without costing you the listing",
    body: "Book Mind reads the whole manuscript before you export and checks it against the patterns Amazon flags. Uniform chapters, thin word counts, missing metadata, absent disclosure. You see the problems while they are still fixable.",
    visual: <PreflightVisual />,
  },
  {
    eyebrow: "Book Mind AI",
    title: "Rewrite with AI",
    body: "Select a sentence and ask for something different. Book Mind returns several takes instead of overwriting your work with its first guess. Keep the one that sounds like you, or leave the page exactly as it was.",
    visual: <RewriteVisual />,
  },
  {
    eyebrow: "Free cover generator",
    title: "A cover drawn from the book you wrote",
    body: "Your title, your author name, your genre, set in type that suits the work. Pick a colour, and the cover is ready for the store listing without opening another tool.",
    visual: <CoversVisual />,
  },
  {
    eyebrow: "Export",
    title: "One book, three formats",
    body: "Export EPUB for Kindle, Kobo, and Apple Books, PDF for print and proofing, DOCX for editors and agents. Open standards throughout, so nothing you make here is trapped here.",
    visual: <ExportVisual />,
  },
  {
    eyebrow: "Local first",
    title: "Your book stays yours",
    body: "The editor is local first and works offline. Nothing leaves the browser unless you turn on sync, and the account is optional. Close the tab and your manuscript is still where you left it.",
    visual: <PrivacyVisual />,
  },
];

type LandingCompositionProps = {
  onStartWriting: () => void;
  hideNav?: boolean;
};

export default function LandingComposition({
  onStartWriting: startWriting,
  hideNav = false,
}: LandingCompositionProps) {
  return (
    <div className="min-h-screen bg-[#1e1e1e] text-[#f5f5f5] overflow-x-hidden">
      {!hideNav && (
        <header className="sticky top-0 z-50 bg-[#1e1e1e]/85 backdrop-blur-md">
          <div
            className={`${SHELL} flex items-center justify-between h-[60px]`}
          >
            <div className="flex items-center gap-2">
              <Image
                src="/make-ebook-logo.svg"
                alt=""
                width={20}
                height={20}
                className="invert"
                aria-hidden="true"
              />
              <span
                className="font-serif font-bold text-white"
                style={{ fontSize: "1.0625rem", letterSpacing: "-0.02em" }}
              >
                makeEbook
              </span>
            </div>
            <button
              onClick={startWriting}
              className="h-9 px-4 rounded-full text-sm text-white/55 hover:text-white hover:bg-white/[0.07] transition-colors"
            >
              Log in
            </button>
          </div>
        </header>
      )}

      <main>
        <section
          className={`${SHELL} pt-24 pb-28 sm:pt-32 sm:pb-36 text-center`}
        >
          <Image
            src="/make-ebook-logo.svg"
            alt=""
            width={72}
            height={72}
            className="invert mx-auto"
            aria-hidden="true"
          />
          <h1
            className="mx-auto mt-10 max-w-[15ch] font-serif font-bold text-white text-balance"
            style={SECTION_TIERS.cinematic.title}
          >
            Built for the writers who finish.
          </h1>
          <p
            className="mx-auto mt-7 max-w-[52ch] text-lg sm:text-xl text-white/65 text-pretty"
            style={BODY}
          >
            Write, format, and export Kindle-ready books. Book Mind AI reads
            your whole manuscript and keeps your listing safe on Amazon.
          </p>
          <div className="mt-11">
            <button
              onClick={startWriting}
              className="px-8 py-4 text-base sm:text-lg font-semibold bg-white text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
            >
              Start writing. It&rsquo;s free.
            </button>
            <p className="mt-4 text-sm text-white/35">
              No install. No credit card.
            </p>
          </div>
        </section>

        <section className={`${SHELL} pb-28 sm:pb-36`}>
          <div className="mx-auto max-w-[46ch] text-center">
            <div className={EYEBROW}>The editor</div>
            <h2
              className="mt-3 font-serif font-bold text-white text-balance"
              style={SECTION_TIERS.standard.title}
            >
              eReader preview mode
            </h2>
            <p className="mt-5 text-lg text-white/65 text-pretty" style={BODY}>
              A live preview of your manuscript as it will appear on a real
              device.
            </p>
          </div>
          <div className="mt-14 sm:mt-16">
            <ReaderSpreadVisual />
          </div>
        </section>

        {ROWS.map((row, i) => (
          <FeatureRow
            key={row.title}
            row={row}
            flip={i % 2 === 1}
            anchor={i === 0 ? "features" : undefined}
          />
        ))}

        <AboutNeilSection />

        <ComparisonSection />

        <FaqSection />

        <section className="relative overflow-hidden bg-[#141413] text-[#faf9f5] py-28 sm:py-40 text-center">
          <div
            aria-hidden
            className="hidden sm:block absolute left-1/2 top-[55%] -translate-x-1/2 -translate-y-1/2 font-serif italic font-bold leading-none pointer-events-none z-0 text-white"
            style={{
              fontSize: "min(32vw, 540px)",
              letterSpacing: "0.05em",
              opacity: 0.03,
            }}
          >
            finish.
          </div>
          <div className={`${SHELL} relative z-10`}>
            <h2
              className="mx-auto max-w-[16ch] font-serif font-bold text-white text-balance"
              style={SECTION_TIERS.cinematic.title}
            >
              Write the book you&rsquo;ve been putting off.
            </h2>
            <p
              className="mx-auto mt-8 max-w-xl text-xl text-white/60"
              style={{ fontFamily: "Georgia, serif" }}
            >
              The blank page has waited long enough.
            </p>
            <div className="mx-auto mt-11 flex w-full max-w-[280px] flex-col gap-3">
              <button
                onClick={startWriting}
                className="px-8 py-4 text-base font-semibold bg-white text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
              >
                Start writing. It&rsquo;s free.
              </button>
              <button
                onClick={startWriting}
                className="px-8 py-4 text-base font-medium text-white/80 bg-white/[0.07] rounded-full hover:bg-white/[0.12] transition-colors"
              >
                Log in
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#2f2f2f]">
        <div
          className={`${SHELL} flex flex-wrap items-center gap-x-8 gap-y-3 py-7 text-sm text-white/35`}
        >
          <span>&copy; makeEbook {new Date().getFullYear()}</span>
          <Link
            href="/make-ebook/blog"
            className="hover:text-white/70 transition-colors"
          >
            Blog
          </Link>
          <a
            href="https://makeebook.ink/privacy"
            className="hover:text-white/70 transition-colors"
          >
            Privacy
          </a>
          <a
            href="https://makeebook.ink/terms"
            className="hover:text-white/70 transition-colors"
          >
            Terms
          </a>
          <button
            type="button"
            onClick={openCookieConsent}
            className="hover:text-white/70 transition-colors"
          >
            Cookie preferences
          </button>
          <span className="ml-auto">
            A{" "}
            <a
              href="https://neilmcardle.com"
              className="underline decoration-white/20 hover:text-white/70 transition-colors"
            >
              neilmcardle.com
            </a>{" "}
            project.
          </span>
        </div>
      </footer>
    </div>
  );
}

function FeatureRow({
  row,
  flip,
  anchor,
}: {
  row: Row;
  flip: boolean;
  anchor?: string;
}) {
  return (
    <section id={anchor} className={SHELL} style={{ scrollMarginTop: "5rem" }}>
      <div className="grid items-center gap-10 py-14 sm:py-16 lg:min-h-[744px] lg:grid-cols-2 lg:gap-16 lg:py-14">
        <div className={flip ? "lg:order-2" : ""}>{row.visual}</div>
        <div className={flip ? "lg:order-1" : ""}>
          <div className={EYEBROW}>{row.eyebrow}</div>
          <h3
            className="mt-3 font-serif font-bold text-white text-balance"
            style={SECTION_TIERS.standard.title}
          >
            {row.title}
          </h3>
          <p
            className="mt-5 max-w-[46ch] text-lg text-white/65 text-pretty"
            style={BODY}
          >
            {row.body}
          </p>
        </div>
      </div>
    </section>
  );
}
