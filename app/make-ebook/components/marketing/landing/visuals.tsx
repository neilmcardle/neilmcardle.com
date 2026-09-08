"use client";

import React from "react";

import { PANEL } from "./tokens";

const RULE = "border-[#2f2f2f]";

function Slot({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto w-full max-w-[632px] aspect-square flex items-center justify-center">
      {children}
    </div>
  );
}

export function ChapterListVisual() {
  const rows = [
    ["01", "Prologue", "420"],
    ["02", "A small inheritance", "1,842"],
    ["03", "Green and blue", "2,103"],
    ["04", "The letter, again", "1,567"],
    ["05", "Pages, stacked", "2,284"],
    ["06", "Small grammars", "891"],
    ["07", "The Midnight Garden", "3,104"],
    ["08", "Twelve hundred words", "1,912"],
  ];
  const active = 6;

  return (
    <Slot>
      <div className={`${PANEL} w-[92%] overflow-hidden`}>
        <div className={`flex items-center gap-2.5 px-5 py-4 border-b ${RULE}`}>
          <span className="relative inline-flex w-1.5 h-1.5 flex-shrink-0">
            <span className="absolute inline-flex w-full h-full rounded-full bg-blue-500 opacity-60 animate-ping" />
            <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-blue-500" />
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/40">
            Your Library &middot; The Midnight Garden
          </span>
        </div>
        <div className="py-1">
          {rows.map(([n, title, words], i) => (
            <div
              key={n}
              className={`flex items-center gap-3 px-5 py-2.5 border-l-2 ${
                i === active
                  ? "bg-blue-600/10 border-blue-600"
                  : "border-transparent"
              }`}
            >
              <span className="font-mono text-[10px] text-white/30 w-5">
                {n}
              </span>
              <span
                className={`flex-1 text-[13px] ${i === active ? "text-white font-medium" : "text-white/55"}`}
              >
                {title}
              </span>
              <span
                className={`font-mono text-[10px] ${i === active ? "text-white/60" : "text-white/25"}`}
              >
                {words}w
              </span>
            </div>
          ))}
        </div>
        <div
          className={`flex justify-between px-5 py-3.5 border-t ${RULE} text-[11px] text-white/30`}
        >
          <span>12 chapters &middot; 86,430 words</span>
          <span className="font-mono text-white/70 font-semibold">78%</span>
        </div>
      </div>
    </Slot>
  );
}

export function PreflightVisual() {
  const checks: [string, string][] = [
    ["Word count", "86,430, suitable for literary fiction"],
    ["Narrative consistency", "strong across all 11 chapters"],
    ["KDP metadata", "title, author, description complete"],
    ["AI disclosure", "generated and ready to paste"],
    ["Listing risks", "none detected"],
  ];

  return (
    <Slot>
      <div className={`${PANEL} w-[92%] overflow-hidden`}>
        <div className={`flex items-center gap-2.5 px-5 py-4 border-b ${RULE}`}>
          <span className="relative inline-flex w-2 h-2 flex-shrink-0">
            <span className="absolute inline-flex w-full h-full rounded-full bg-emerald-400 opacity-60 animate-ping" />
            <span className="relative inline-flex w-2 h-2 rounded-full bg-emerald-400" />
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/45">
            Book Mind &middot; Pre-flight
          </span>
        </div>
        <div className="px-5 pt-5 pb-6 space-y-3.5">
          {checks.map(([label, value]) => (
            <div key={label} className="flex gap-3 items-start">
              <span className="font-mono text-emerald-400 text-[12px] mt-[3px]">
                &#10003;
              </span>
              <p
                className="m-0 text-[14px] leading-relaxed"
                style={{ fontFamily: "Georgia, serif" }}
              >
                <span className="text-white/40">{label}:</span>{" "}
                <span className="text-white/75">{value}</span>
              </p>
            </div>
          ))}
          <div className={`border-t ${RULE} pt-4`}>
            <p
              className="m-0 text-[15px] text-white"
              style={{ fontFamily: "Georgia, serif", fontStyle: "italic" }}
            >
              Ready to upload to KDP.
            </p>
          </div>
        </div>
      </div>
    </Slot>
  );
}

export function RewriteVisual() {
  const takes: [string, string][] = [
    [
      "Tighter &middot; Your voice",
      "The story had waited too long. She felt it in her bones.",
    ],
    [
      "Plainer",
      "The story had been waiting a long time, and she could feel it.",
    ],
    ["Warmer", "The story had waited so long she carried it in her bones."],
  ];

  return (
    <Slot>
      <div className={`${PANEL} w-[92%] overflow-hidden`}>
        <div className="px-5 py-5">
          <p
            className="m-0"
            style={{
              fontFamily: "Georgia, serif",
              fontSize: 15.5,
              lineHeight: 1.75,
              color: "rgba(255,255,255,.70)",
            }}
          >
            Sarah pressed on, even as the familiar doubt crept in.{" "}
            <span
              className="rounded-[3px] px-1 py-0.5"
              style={{
                background: "rgba(37,99,235,.18)",
                boxShadow: "inset 0 0 0 1px rgba(37,99,235,.45)",
              }}
            >
              The story had been waiting too long, and she could feel it in her
              bones.
            </span>
          </p>
        </div>

        <div
          className={`flex items-center gap-2.5 px-4 py-3 border-y ${RULE} bg-[#1e1e1e]`}
        >
          <span
            className={`font-mono text-[10px] text-white/40 bg-[#262626] border ${RULE} px-2 py-1 rounded`}
          >
            &#8984;K
          </span>
          <span className="font-mono text-[12.5px] text-white/80">
            rewrite tighter, keep the rhythm
          </span>
        </div>

        <div className={`divide-y ${RULE}`}>
          {takes.map(([tag, text], i) => (
            <div
              key={tag}
              className={`px-5 py-4 ${i === 0 ? "bg-blue-600/[0.08]" : ""}`}
            >
              <div
                className={`text-[9.5px] font-semibold uppercase tracking-[0.2em] mb-2 ${
                  i === 0 ? "text-blue-400" : "text-white/30"
                }`}
                dangerouslySetInnerHTML={{ __html: tag }}
              />
              <p
                className="m-0 text-[13.5px] leading-relaxed"
                style={{
                  fontFamily: "Georgia, serif",
                  color:
                    i === 0 ? "rgba(255,255,255,.85)" : "rgba(255,255,255,.45)",
                }}
              >
                {text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Slot>
  );
}

export function CoversVisual() {
  const books = [
    {
      t: "The Cartographer&rsquo;s Daughter",
      a: "Hollings",
      bg: "#1a2540",
      fg: "#f5ecd5",
      r: -8,
      x: -34,
      y: 8,
      z: 1,
    },
    {
      t: "A Quiet Conspiracy of Moths",
      a: "Mehta",
      bg: "#7a1a1a",
      fg: "#f5e8c7",
      r: 0,
      x: 0,
      y: 0,
      z: 3,
    },
    {
      t: "The Lamplighter&rsquo;s Ledger",
      a: "Dubh&aacute;n",
      bg: "#0e3a2e",
      fg: "#e8d7a8",
      r: 8,
      x: 34,
      y: 8,
      z: 2,
    },
  ];

  return (
    <Slot>
      <div className="relative w-[70%] aspect-[2/3]">
        {books.map((b) => (
          <div
            key={b.a}
            className="absolute inset-0 rounded-[4px] p-6 flex flex-col justify-center items-center text-center"
            style={{
              background: b.bg,
              color: b.fg,
              zIndex: b.z,
              transform: `translate(${b.x}%, ${b.y}%) rotate(${b.r}deg) scale(${b.z === 3 ? 1 : 0.92})`,
              boxShadow:
                "0 30px 60px -20px rgba(0,0,0,.7), inset -3px 0 8px rgba(0,0,0,.18), inset 3px 0 8px rgba(255,255,255,.04)",
            }}
          >
            <span className="absolute left-1.5 top-0 bottom-0 w-px bg-black/15" />
            <div className="text-[9px] uppercase tracking-[0.28em] font-semibold opacity-75 mb-3">
              {b.a}
            </div>
            <div className="w-7 h-px bg-current opacity-50 mb-2.5" />
            <div
              className="font-serif font-bold text-[19px] leading-[1.05] text-balance"
              dangerouslySetInnerHTML={{ __html: b.t }}
            />
            <div className="w-7 h-px bg-current opacity-50 mt-2.5 mb-2.5" />
            <div className="text-[9px] uppercase tracking-[0.28em] font-semibold opacity-50">
              makeEbook
            </div>
          </div>
        ))}
      </div>
    </Slot>
  );
}

export function ExportVisual() {
  const formats: [string, string][] = [
    ["EPUB", "Kindle, Kobo, Apple Books"],
    ["PDF", "Print and proofing"],
    ["DOCX", "Editors and agents"],
  ];

  return (
    <Slot>
      <div className="w-[86%] space-y-4">
        {formats.map(([name, sub], i) => (
          <div
            key={name}
            className={`${PANEL} flex items-center gap-4 px-5 py-4`}
            style={{
              transform: `translateX(${i === 1 ? 34 : i === 2 ? 17 : 0}px)`,
            }}
          >
            <span
              className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-mono text-[10px] font-semibold ${
                i === 0
                  ? "bg-blue-600/15 text-blue-400"
                  : "bg-white/[0.05] text-white/40"
              }`}
            >
              {name.slice(0, 2)}
            </span>
            <div className="min-w-0">
              <div className="text-[14px] font-medium text-white/85">
                {name}
              </div>
              <div className="text-[12px] text-white/35">{sub}</div>
            </div>
            <span className="ml-auto text-white/25 text-[16px]">&#8595;</span>
          </div>
        ))}
      </div>
    </Slot>
  );
}

export function PrivacyVisual() {
  const facts: [string, string][] = [
    ["Your manuscript", "Never leaves the browser unless you sync"],
    ["Export formats", "EPUB 3, PDF, DOCX. Open standards"],
    ["Account", "Optional. The editor works signed out"],
  ];

  return (
    <Slot>
      <div className={`${PANEL} w-[86%] overflow-hidden`}>
        <div className="px-6 py-6 space-y-5">
          <div className="flex items-center gap-3">
            <span className="relative inline-flex w-2 h-2 flex-shrink-0">
              <span className="absolute inline-flex w-full h-full rounded-full bg-emerald-400 opacity-60 animate-ping" />
              <span className="relative inline-flex w-2 h-2 rounded-full bg-emerald-400" />
            </span>
            <span className="text-[13px] text-white/70">
              Working offline. All changes saved on this device.
            </span>
          </div>
          <div className={`border-t ${RULE}`} />
          {facts.map(([label, value]) => (
            <div key={label}>
              <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/35 mb-1.5">
                {label}
              </div>
              <div
                className="text-[14px] text-white/65"
                style={{ fontFamily: "Georgia, serif" }}
              >
                {value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Slot>
  );
}

export function ReaderSpreadVisual() {
  const body = [
    "The morning light fell across the old manuscript pages, illuminating years of careful revision. She had written this story a hundred times in her mind before committing a single word to paper.",
    "Sarah pressed on, even as the familiar doubt crept in. The story had been waiting too long, and she could feel it in her bones like a forgotten promise.",
    "There was no going back now.",
  ];

  return (
    <div className="relative mx-auto w-full max-w-[1075px] aspect-[16/9]">
      <div className="absolute inset-0 rounded-[20px] overflow-hidden flex flex-col bg-[#f7f4ea] shadow-[0_50px_120px_-40px_rgba(0,0,0,0.9)]">
        <div className="flex items-center justify-center px-5 py-3.5 border-b border-gray-200 bg-white/60">
          <span
            className="text-[12.5px] text-gray-500 italic"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Paperwhite &middot; Libre Baskerville &middot; 11pt
          </span>
        </div>
        <div className="flex-1 px-8 sm:px-16 py-8 sm:py-12 overflow-hidden">
          <h3 className="font-serif text-[12px] tracking-[0.35em] uppercase font-medium text-center text-gray-400 mb-2">
            Chapter Seven
          </h3>
          <h2
            className="font-serif font-bold text-[26px] sm:text-[34px] text-center mb-7 leading-[1.1] text-gray-900"
            style={{ letterSpacing: "-0.02em" }}
          >
            The Midnight Garden
          </h2>
          <div
            className="max-w-[52ch] mx-auto"
            style={{
              fontFamily: '"Libre Baskerville", Georgia, serif',
              fontSize: "15px",
              lineHeight: 1.75,
              color: "#2a2a28",
            }}
          >
            {body.map((p, i) => (
              <p
                key={i}
                className={`mb-3.5 text-justify ${
                  i === 0
                    ? "first-letter:font-serif first-letter:font-bold first-letter:text-[58px] first-letter:float-left first-letter:leading-[0.8] first-letter:mr-2.5 first-letter:mt-1 first-letter:text-gray-900"
                    : "indent-[1.5em]"
                }`}
              >
                {p}
              </p>
            ))}
          </div>
        </div>
        <div className="flex justify-between px-5 py-3.5 border-t border-gray-200 bg-white/60 font-mono text-[11px] text-gray-400">
          <span>Chapter Seven</span>
          <span>172 / 312</span>
        </div>
      </div>
    </div>
  );
}
