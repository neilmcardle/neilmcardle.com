import React from "react";
import styles from "./brand.module.css";

const PANEL =
  "rounded-2xl bg-[#1b1b18] border border-[#2a2a28] shadow-[0_40px_90px_-30px_rgba(0,0,0,0.85)]";
const RULE = "border-[#2a2a28]";
const ACID = "#deea53";
const MANUSCRIPT = {
  fontFamily: '"Libre Baskerville", Georgia, serif',
} as const;

function Slot({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto w-full max-w-[632px] aspect-square flex items-center justify-center">
      {children}
    </div>
  );
}

function Dot({ color }: { color: string }) {
  return (
    <span
      className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0"
      style={{ background: color }}
    />
  );
}

export function ChapterListVisual() {
  const rows = [
    ["34", "A small inheritance", "1,842"],
    ["35", "Green and blue", "2,103"],
    ["36", "The letter, again", "1,567"],
    ["37", "Pages, stacked", "2,284"],
    ["38", "Small grammars", "891"],
    ["39", "Pewter", "1,466"],
    ["40", "The Rainy City", "3,104"],
    ["41", "Twelve hundred words", "1,912"],
  ];
  const active = 6;

  return (
    <Slot>
      <div className={`${PANEL} w-[92%] overflow-hidden`}>
        <div className={`flex items-center gap-2.5 px-5 py-4 border-b ${RULE}`}>
          <Dot color={ACID} />
          <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8e8b82]">
            Your Library &middot; The Rainy City
          </span>
        </div>
        <div className="py-1">
          {rows.map(([n, title, words], i) => (
            <div
              key={n}
              className={`flex items-center gap-3 px-5 py-2.5 border-l-2 ${
                i === active
                  ? "bg-[#deea53]/[0.06] border-[#deea53]"
                  : "border-transparent"
              }`}
            >
              <span className="font-mono text-[10px] text-[#8e8b82]/70 w-5">
                {n}
              </span>
              <span
                className={`flex-1 text-[13px] ${i === active ? "text-[#f3efe5] font-medium" : "text-[#d8d4c9]/70"}`}
              >
                {title}
              </span>
              <span
                className={`font-mono text-[10px] ${i === active ? "text-[#d8d4c9]" : "text-[#8e8b82]/60"}`}
              >
                {words}w
              </span>
            </div>
          ))}
        </div>
        <div
          className={`flex justify-between px-5 py-3.5 border-t ${RULE} text-[11px] text-[#8e8b82]`}
        >
          <span>44 chapters &middot; 128,430 words</span>
          <span className="font-mono text-[#f3efe5] font-semibold">78%</span>
        </div>
      </div>
    </Slot>
  );
}

export function PreflightVisual() {
  const checks: [string, string][] = [
    ["Word count", "128,430, suitable for literary fiction"],
    ["Narrative consistency", "strong across all 44 chapters"],
    ["KDP metadata", "title, author, description complete"],
    ["AI disclosure", "generated and ready to paste"],
    ["Listing risks", "none detected"],
  ];

  return (
    <Slot>
      <div className={`${PANEL} w-[92%] overflow-hidden`}>
        <div className={`flex items-center gap-2.5 px-5 py-4 border-b ${RULE}`}>
          <Dot color="#34d399" />
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#8e8b82]">
            Book Mind &middot; Pre-flight
          </span>
        </div>
        <div className="px-5 pt-5 pb-6 space-y-3.5">
          {checks.map(([label, value]) => (
            <div key={label} className="flex gap-3 items-start">
              <span className="font-mono text-[#34d399] text-[12px] mt-[3px]">
                &#10003;
              </span>
              <p className="m-0 text-[14px] leading-relaxed" style={MANUSCRIPT}>
                <span className="text-[#8e8b82]">{label}:</span>{" "}
                <span className="text-[#d8d4c9]">{value}</span>
              </p>
            </div>
          ))}
          <div className={`border-t ${RULE} pt-4`}>
            <p
              className="m-0 text-[15px] text-[#f3efe5] italic"
              style={MANUSCRIPT}
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
  const takes: [React.ReactNode, string][] = [
    [
      <>Tighter &middot; Your voice</>,
      "Below her the water was pewter. The iron columns went into it without a sound.",
    ],
    [
      "Plainer",
      "The water below was grey, and the old iron columns went into it silently.",
    ],
    [
      "Warmer",
      "The water lay pewter-still beneath her, and the old iron columns slipped into it without a sound.",
    ],
  ];

  return (
    <Slot>
      <div className={`${PANEL} w-[92%] overflow-hidden`}>
        <div className="px-5 py-5">
          <p
            className="m-0 text-[15.5px] leading-[1.75] text-[#d8d4c9]"
            style={MANUSCRIPT}
          >
            Elena walked the length of the pier with her collar up.{" "}
            <span
              className="rounded-[3px] px-1 py-0.5"
              style={{
                background: "rgba(222, 234, 83,.08)",
                boxShadow: "inset 0 0 0 1px rgba(222, 234, 83,.45)",
              }}
            >
              The water below was the colour of pewter, and the old iron columns
              went down into it without a sound.
            </span>
          </p>
        </div>

        <div
          className={`flex items-center gap-2.5 px-4 py-3 border-y ${RULE} bg-[#141413]`}
        >
          <span
            className={`font-mono text-[10px] text-[#8e8b82] bg-[#1b1b18] border ${RULE} px-2 py-1 rounded`}
          >
            &#8984;K
          </span>
          <span className="font-mono text-[12.5px] text-[#d8d4c9]">
            rewrite tighter, keep the rhythm
          </span>
        </div>

        <div className={`divide-y ${RULE}`}>
          {takes.map(([tag, text], i) => (
            <div
              key={text}
              className={`px-5 py-4 ${i === 0 ? "bg-[#deea53]/[0.05]" : ""}`}
            >
              <div
                className={`text-[9.5px] font-semibold uppercase tracking-[0.2em] mb-2 ${
                  i === 0 ? "text-[#deea53]" : "text-[#8e8b82]/70"
                }`}
              >
                {tag}
              </div>
              <p
                className={`m-0 text-[13.5px] leading-relaxed ${i === 0 ? "text-[#f3efe5]" : "text-[#8e8b82]"}`}
                style={MANUSCRIPT}
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
  const covers = [
    {
      author: "Smith",
      title: "The Major Alternative",
      tone: styles.coverPaper,
      place: styles.coverBack,
    },
    {
      author: "Dubhán",
      title: <>The Lamplighter&rsquo;s Ledger</>,
      tone: styles.coverAcid,
      place: styles.coverFront,
    },
  ];

  return (
    <div className={styles.coversStage}>
      {covers.map((c) => (
        <div key={c.author} className={`${styles.cover} ${c.tone} ${c.place}`}>
          <span className={styles.coverLabel}>{c.author}</span>
          <span className={styles.coverRule} />
          <span className={styles.coverTitle}>{c.title}</span>
          <span className={styles.coverRule} />
          <span className={`${styles.coverLabel} ${styles.coverBrand}`}>
            makeEbook
          </span>
        </div>
      ))}
    </div>
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
          >
            <span
              className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-mono text-[10px] font-semibold ${
                i === 0
                  ? "bg-[#deea53]/[0.12] text-[#deea53]"
                  : "bg-white/[0.05] text-[#8e8b82]"
              }`}
            >
              {name.slice(0, 2)}
            </span>
            <div className="min-w-0">
              <div className="text-[14px] font-medium text-[#f3efe5]">
                {name}
              </div>
              <div className="text-[12px] text-[#8e8b82]">{sub}</div>
            </div>
            <span className="ml-auto text-[#8e8b82]/70 text-[16px]">
              &#8595;
            </span>
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
            <Dot color="#34d399" />
            <span className="text-[13px] text-[#d8d4c9]">
              Working offline. All changes saved on this device.
            </span>
          </div>
          <div className={`border-t ${RULE}`} />
          {facts.map(([label, value]) => (
            <div key={label}>
              <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8e8b82] mb-1.5">
                {label}
              </div>
              <div className="text-[14px] text-[#d8d4c9]" style={MANUSCRIPT}>
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
    "Rain had been falling on the city since before she woke, the soft kind that does not so much fall as arrive, settling on the windows and the wet slate roofs until every surface carried a little of the sky.",
    "Elena walked the length of the pier with her collar up and the manuscript held flat against her chest, its pages still warm from the bag. The water below was the colour of pewter, and the old iron columns went down into it without a sound.",
    "At the end of the pier she stopped and let the rain find her face. Somewhere behind her a gull cried once and gave up. She had come here to decide something, and the city, patient as ever, was waiting for her to say it aloud.",
  ];

  return (
    <div className="relative mx-auto w-full max-w-[1075px] sm:aspect-[16/9]">
      <div
        className={`sm:absolute sm:inset-0 ${PANEL} rounded-[20px] overflow-hidden flex flex-col`}
      >
        <div className="flex-1 px-8 sm:px-16 py-8 sm:py-12 overflow-hidden">
          <h3 className="text-[11px] tracking-[0.35em] uppercase font-semibold text-center text-[#8e8b82] mb-2">
            Chapter Forty
          </h3>
          <h2
            className="text-[28px] sm:text-[38px] text-center mb-7 leading-[1.1] text-[#f3efe5] font-medium"
            style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
          >
            The Rainy City
          </h2>
          <div
            className="max-w-[52ch] mx-auto text-[15px] leading-[1.75] text-[#d8d4c9]"
            style={MANUSCRIPT}
          >
            {body.map((p, i) => (
              <p
                key={p}
                className={`mb-3.5 text-justify ${i > 1 ? "hidden sm:block" : ""} ${
                  i === 0 ? "" : "indent-[1.5em]"
                }`}
              >
                {p}
              </p>
            ))}
          </div>
        </div>
        <div
          className={`flex justify-between px-5 py-3.5 border-t ${RULE} font-mono text-[11px] text-[#8e8b82]`}
        >
          <span>Chapter Forty</span>
          <span>521 / 612</span>
        </div>
      </div>
    </div>
  );
}
