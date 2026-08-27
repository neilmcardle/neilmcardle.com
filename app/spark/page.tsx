import type { Metadata } from "next";
import Link from "next/link";
import { SparkWaitlistForm } from "./SparkWaitlistForm";

export const metadata: Metadata = {
  title: "Spark — Become an engineer",
  description:
    "A learning platform built from a spark, to teach designers full-stack engineering. A course built for designers, by a designer, so they can build for themselves.",
};

export default function SparkPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] relative isolate overflow-hidden">
      <div className="max-w-3xl mx-auto px-6 lg:px-12 pt-16 lg:pt-24 pb-20">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-16"
          style={{
            fontFamily: "var(--font-inter)",
            fontSize: "0.75rem",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span>Neil McArdle</span>
        </Link>

        <div
          className="text-white/40 mb-6"
          style={{
            fontFamily: "var(--font-inter)",
            fontSize: "0.75rem",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
          }}
        >
          + Free while it is being built
        </div>

        <h1
          className="text-white mb-8"
          style={{
            fontFamily: "var(--font-playfair)",
            fontSize: "clamp(3.5rem, 12vw, 6rem)",
            fontWeight: 900,
            letterSpacing: "-0.03em",
            lineHeight: 0.9,
            textTransform: "uppercase",
          }}
        >
          Spark
        </h1>

        <p
          className="text-white mb-10 max-w-xl"
          style={{
            fontFamily: "var(--font-playfair)",
            fontSize: "clamp(1.25rem, 3vw, 1.75rem)",
            fontWeight: 400,
            lineHeight: 1.4,
            fontStyle: "italic",
          }}
        >
          A course that takes designers to full-stack engineer. Built for
          designers, by a designer, so they can build for themselves.
        </p>

        <div
          className="space-y-5 text-white/70 max-w-xl mb-12"
          style={{
            fontFamily: "var(--font-inter)",
            fontSize: "0.9375rem",
            lineHeight: 1.7,
          }}
        >
          <p>
            Most designers can read HTML, CSS, and a bit of JavaScript. They can
            prompt their way to a working app. What they cannot do is sit down
            cold and build from scratch. Spark fixes that.
          </p>
        </div>

        <div
          className="text-white/40 mb-4"
          style={{
            fontFamily: "var(--font-inter)",
            fontSize: "0.6875rem",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
          }}
        >
          + Read it now, free
        </div>
        <Link
          href="/spark/lessons"
          className="inline-flex min-h-[48px] items-center gap-2.5 rounded-full bg-[#d8b46a] px-6 text-[#0a0a0a] transition-transform hover:-translate-y-px"
          style={{
            fontFamily: "var(--font-inter)",
            fontSize: "0.875rem",
            fontWeight: 600,
          }}
        >
          Start reading
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M5 12h13M12 5l7 7-7 7" />
          </svg>
        </Link>
        <p
          className="text-white/50 mt-4 max-w-xl"
          style={{
            fontFamily: "var(--font-inter)",
            fontSize: "0.8125rem",
            lineHeight: 1.65,
          }}
        >
          Nineteen modules are readable today. They are still being written and
          edited in public, so expect rough edges and expect them to change.
        </p>

        <div
          className="text-white/40 mt-12 mb-4"
          style={{
            fontFamily: "var(--font-inter)",
            fontSize: "0.6875rem",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
          }}
        >
          + Know when it is finished
        </div>
        <SparkWaitlistForm />
      </div>
    </div>
  );
}
