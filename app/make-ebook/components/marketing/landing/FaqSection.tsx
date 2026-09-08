"use client";

import React, { useState } from "react";

import FadeIn from "../FadeIn";
import { FAQ } from "../marketing-content";
import { SECTION_TIERS } from "../sectionTiers";
import { EYEBROW, SHELL } from "./tokens";

const OMIT = /refund/i;

export default function FaqSection() {
  const [open, setOpen] = useState<number | null>(null);
  const items = FAQ.filter((item) => !OMIT.test(item.q));

  return (
    <section className={SECTION_TIERS.standard.section}>
      <div className={SHELL}>
        <FadeIn>
          <div className="max-w-3xl mb-14">
            <div className={EYEBROW}>Common questions</div>
            <h2
              className="mt-3 font-serif font-bold text-white text-balance"
              style={SECTION_TIERS.standard.title}
            >
              Things worth knowing.
            </h2>
          </div>
        </FadeIn>

        <FadeIn delay={100}>
          <div className="max-w-3xl divide-y divide-[#2f2f2f]">
            {items.map((item, i) => (
              <div key={item.q} className="py-6">
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  aria-expanded={open === i}
                  className="w-full flex items-start justify-between gap-6 text-left group"
                >
                  <h3
                    className="font-semibold text-white text-balance group-hover:text-white/80 transition-colors"
                    style={{ fontSize: "1.0625rem", lineHeight: 1.4 }}
                  >
                    {item.q}
                  </h3>
                  <span
                    className="text-white/30 flex-shrink-0 mt-1 transition-transform duration-200"
                    style={{ transform: open === i ? "rotate(45deg)" : "none" }}
                    aria-hidden
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M8 3v10M3 8h10"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                </button>
                {open === i && (
                  <p
                    className="mt-4 text-white/60 text-pretty"
                    style={{
                      fontFamily: "Georgia, serif",
                      fontSize: 15,
                      lineHeight: 1.7,
                    }}
                  >
                    {item.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
