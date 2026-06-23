'use client';

import React from 'react';
import Image from 'next/image';
import FadeIn from '../FadeIn';

export default function AboutNeilSection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
        <div className="grid lg:grid-cols-[320px_1fr] gap-12 lg:gap-20 items-start">

          <FadeIn>
            <div className="flex flex-col items-start gap-5">
              <div className="relative">
                <Image
                  src="/me.png"
                  alt="Neil McArdle"
                  width={200}
                  height={200}
                  className="rounded-2xl object-cover w-[200px] h-[200px] grayscale"
                />
              </div>
              <div>
                <p className="font-serif font-bold text-white text-xl" style={{ letterSpacing: '-0.02em' }}>
                  Neil McArdle
                </p>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40 mt-1">
                  Founder &amp; developer
                </p>
              </div>
              <div className="flex gap-4 text-sm">
                <a
                  href="https://x.com/BetterNeil"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/40 hover:text-white transition-colors"
                >
                  @BetterNeil
                </a>
                <span className="text-white/20">·</span>
                <a
                  href="https://neilmcardle.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/40 hover:text-white transition-colors"
                >
                  neilmcardle.com
                </a>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={100}>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/40 mb-5">
                The builder
              </div>
              <h2
                className="font-serif font-bold text-white text-balance mb-8"
                style={{
                  fontSize: 'clamp(1.75rem, 2.5vw + 0.75rem, 2.75rem)',
                  letterSpacing: '-0.035em',
                  lineHeight: 1.1,
                }}
              >
                Built by someone who lived the pain.
              </h2>
              <div
                className="space-y-5 text-white/65"
                style={{ fontFamily: 'Georgia, serif', fontSize: 17, lineHeight: 1.7 }}
              >
                <p>
                  Before makeEbook, I worked in production ebook publishing for an independent press. Every book we released followed the same grind: scan the original print copy, run it through OCR, clean up the mess in InDesign, format in Sigil, hand-correct the output, test on a Kindle. Every step was a different tool, and every step had a different way to fail.
                </p>
                <p>
                  makeEbook is the tool I wanted then. Browser-based, no install, one place for the whole last mile. If you have been in the weeds with Sigil or sweating an Amazon rejection, I built this for you.
                </p>
                <p>
                  It is a one-person project. No roadmap dictated by investors. Every email reaches me directly. You can reply to any email and get a real answer.
                </p>
              </div>
              <p
                className="mt-8 font-serif italic text-white/40 text-base"
                style={{ letterSpacing: '-0.01em' }}
              >
                — Neil
              </p>
            </div>
          </FadeIn>

        </div>
      </div>
    </section>
  );
}
