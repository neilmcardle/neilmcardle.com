"use client";

import { useState } from "react";
import { Mail, Copy } from "lucide-react";
import Image from "next/image";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function ProfileCardHomepage() {
  const [showEmail, setShowEmail] = useState(false);
  const [copied, setCopied] = useState(false);
  const email = "neil@neilmcardle.com";

  const handleReveal = () => setShowEmail(true);

  const handleCopy = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#111] transition-colors">
      {/* Theme toggle — fixed top right */}
      <div className="fixed top-6 right-6 z-10">
        <ThemeToggle />
      </div>

      {/* Centered column */}
      <div className="flex flex-col items-center px-8 pt-12 pb-36 gap-16 max-w-[850px] mx-auto">

        {/* Logomark */}
        <div className="flex flex-col items-center gap-8">
          <Image
            src="/neil-mcardle-logomark.svg"
            alt="Neil McArdle"
            width={36}
            height={36}
            className="object-contain dark:invert opacity-80"
            priority
            style={{ color: 'transparent' }}
          />

          {/* 3D Avatar */}
          <div className="relative">
            <Image
              src="/3d-me.png"
              alt="Neil McArdle"
              width={160}
              height={160}
              className="object-contain dark:hidden"
            />
            <Image
              src="/3d-me-dark.png"
              alt="Neil McArdle"
              width={160}
              height={160}
              className="object-contain hidden dark:block"
            />
          </div>
        </div>

        {/* Name & title */}
        <div className="flex flex-col items-center gap-3 text-center">
          <h1
            className="text-4xl sm:text-5xl text-black dark:text-white"
            style={{ fontFamily: 'var(--font-playfair)', fontWeight: 400, letterSpacing: '-0.01em', lineHeight: '1.2' }}
          >
            Neil McArdle
          </h1>
          <p
            className="text-base text-black/60 dark:text-white/50"
            style={{ fontFamily: 'var(--font-inter)' }}
          >
            Creative Founder
          </p>
        </div>


        {/* Divider */}
        <div className="w-full h-px bg-black/10 dark:bg-white/10" />

        {/* Products */}
        <div className="flex flex-col items-center gap-6 text-center">
          <p
            className="text-xs uppercase tracking-widest text-black/40 dark:text-white/30"
            style={{ fontFamily: 'var(--font-inter)' }}
          >
            Products
          </p>
          <a
            href="https://makeebook.ink"
            target="_blank"
            rel="noopener noreferrer"
            className="opacity-60 hover:opacity-100 transition-opacity duration-200"
            title="makeEbook — free browser-based eBook editor"
          >
            <img src="/make-ebook-logomark.svg" alt="makeEbook" className="h-8 w-auto dark:hidden" />
            <img src="/dark-make-ebook-logomark.svg" alt="makeEbook" className="h-8 w-auto hidden dark:block" />
          </a>
        </div>


        {/* Divider */}
        <div className="w-full h-px bg-black/10 dark:bg-white/10" />

        {/* Social + Email */}
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-6">
            {/* GitHub */}
            <a
              href="https://github.com/neilmcardle"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="opacity-40 hover:opacity-90 transition-opacity duration-200"
            >
              <svg width="20" height="20" viewBox="0 0 98 96" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z" className="fill-black dark:fill-white" />
              </svg>
            </a>

            {/* X / Twitter */}
            <a
              href="https://x.com/BetterNeil"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X"
              className="opacity-40 hover:opacity-90 transition-opacity duration-200"
            >
              <svg width="18" height="18" viewBox="0 0 1200 1227" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z" className="fill-black dark:fill-white" />
              </svg>
            </a>

            {/* Email toggle */}
            {!showEmail && (
              <button
                type="button"
                onClick={handleReveal}
                className="opacity-40 hover:opacity-90 transition-opacity duration-200"
                aria-label="Show email"
              >
                <Mail className="w-5 h-5 text-black dark:text-white" />
              </button>
            )}
          </div>

          {/* Email reveal */}
          {showEmail && (
            <div className="inline-flex items-center gap-2 bg-black/5 dark:bg-white/10 px-4 py-2 rounded-full text-sm transition-colors">
              <span
                className="text-black/70 dark:text-white/70"
                style={{ fontFamily: 'var(--font-inter)' }}
              >
                {email}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded transition-colors"
                aria-label="Copy email"
              >
                <Copy className="w-4 h-4 text-black/50 dark:text-white/50" />
              </button>
              {copied && (
                <span className="text-green-600 dark:text-green-400 text-xs">Copied!</span>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
