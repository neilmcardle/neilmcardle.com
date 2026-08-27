"use client";

import React, { useState } from "react";
import { WidgetShell } from "./WidgetShell";

type Mode = "look" | "listen";

interface Announcement {
  role: string | null;
  text: string;
}

interface Version {
  id: "soup" | "semantic";
  label: string;
  markup: string;
  announcements: Announcement[];
  tabStops: number;
  headings: number;
  landmarks: number;
}

const SOUP: Version = {
  id: "soup",
  label: "Div soup",
  markup: `<div class="nav">
  <div class="links">
    <span class="link">Home</span>
    <span class="link">Work</span>
  </div>
</div>
<div class="heading">Recent work</div>
<div class="btn">See all</div>`,
  announcements: [
    { role: null, text: "Home" },
    { role: null, text: "Work" },
    { role: null, text: "Recent work" },
    { role: null, text: "See all" },
  ],
  tabStops: 0,
  headings: 0,
  landmarks: 0,
};

const SEMANTIC: Version = {
  id: "semantic",
  label: "Semantic",
  markup: `<nav aria-label="Main">
  <ul>
    <li><a href="/">Home</a></li>
    <li><a href="/work">Work</a></li>
  </ul>
</nav>
<h2>Recent work</h2>
<button>See all</button>`,
  announcements: [
    { role: "navigation landmark", text: "Main" },
    { role: "list", text: "2 items" },
    { role: "link", text: "Home, 1 of 2" },
    { role: "link", text: "Work, 2 of 2" },
    { role: "heading level 2", text: "Recent work" },
    { role: "button", text: "See all" },
  ],
  tabStops: 3,
  headings: 1,
  landmarks: 1,
};

function Rendered() {
  return (
    <div
      className="rounded-lg bg-white p-4"
      style={{ boxShadow: "inset 0 0 0 1px rgba(20,20,19,0.08)" }}
    >
      <div className="mb-4 flex gap-4 border-b border-black/[0.08] pb-3">
        <span className="text-[13px] font-medium text-[var(--spark-text)]">
          Home
        </span>
        <span className="text-[13px] font-medium text-[var(--spark-text)]">
          Work
        </span>
      </div>
      <p className="mb-3 font-serif text-[17px] font-bold tracking-[-0.015em] text-[var(--spark-text)]">
        Recent work
      </p>
      <span className="inline-block rounded-full bg-[var(--spark-ink)] px-3.5 py-1.5 text-[12px] font-medium text-white">
        See all
      </span>
    </div>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  const zero = value === 0;
  return (
    <div
      className="rounded-md px-2.5 py-2 text-center"
      style={{
        background: zero ? "rgba(184,84,58,0.09)" : "rgba(216,180,106,0.14)",
      }}
    >
      <div
        className="spark-mono text-[15px] font-semibold tabular-nums"
        style={{ color: zero ? "#b8543a" : "var(--spark-gold-ink)" }}
      >
        {value}
      </div>
      <div className="spark-eyebrow mt-0.5 text-[9.5px] text-[var(--spark-faint)]">
        {label}
      </div>
    </div>
  );
}

function Panel({ version, mode }: { version: Version; mode: Mode }) {
  return (
    <div className="min-w-0">
      <div className="mb-2.5 flex items-baseline gap-2">
        <span className="spark-eyebrow text-[var(--spark-text)]">
          {version.label}
        </span>
      </div>

      {mode === "look" ? (
        <>
          <Rendered />
          <pre className="spark-mono mt-2.5 overflow-x-auto rounded-lg bg-[var(--spark-ink)] p-3 text-[11px] leading-[1.7] text-[var(--spark-on-dark)]">
            <code>{version.markup}</code>
          </pre>
        </>
      ) : (
        <>
          <ol className="flex list-none flex-col gap-1.5 rounded-lg bg-[var(--spark-ink)] p-3 pl-3">
            {version.announcements.map((item, i) => (
              <li key={i} className="flex items-baseline gap-2">
                <span
                  aria-hidden
                  className="spark-mono shrink-0 text-[10px] tabular-nums"
                  style={{ color: "var(--spark-on-dark-dim)" }}
                >
                  {i + 1}
                </span>
                <span className="min-w-0 text-[12.5px] leading-[1.6]">
                  {item.role && (
                    <span
                      className="spark-mono mr-1.5 rounded px-1.5 py-0.5 text-[10px]"
                      style={{
                        background: "rgba(216,180,106,0.18)",
                        color: "var(--spark-gold)",
                      }}
                    >
                      {item.role}
                    </span>
                  )}
                  <span style={{ color: "rgba(255,255,255,0.82)" }}>
                    {item.text}
                  </span>
                </span>
              </li>
            ))}
          </ol>
          <div className="mt-2.5 grid grid-cols-3 gap-1.5">
            <Stat value={version.tabStops} label="Tab stops" />
            <Stat value={version.headings} label="Headings" />
            <Stat value={version.landmarks} label="Landmarks" />
          </div>
        </>
      )}
    </div>
  );
}

export function SemanticListen() {
  const [mode, setMode] = useState<Mode>("look");

  return (
    <WidgetShell
      title="Same pixels. Now listen to them."
      caption="The announcements are what a screen reader reads out as it walks each tree. The counters are what it can jump between: Tab stops, the headings list, and the landmarks menu."
      onReset={mode === "listen" ? () => setMode("look") : undefined}
      status={mode === "look" ? "looking" : "listening"}
    >
      <div
        role="group"
        aria-label="View mode"
        className="mb-5 inline-flex rounded-full p-1"
        style={{ background: "rgba(20,20,19,0.055)" }}
      >
        {(["look", "listen"] as Mode[]).map((value) => {
          const active = mode === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => setMode(value)}
              aria-pressed={active}
              className="min-h-[36px] rounded-full px-5 text-[13px] font-semibold capitalize transition-colors"
              style={{
                background: active ? "var(--spark-ink)" : "transparent",
                color: active ? "#fff" : "var(--spark-muted)",
              }}
            >
              {value}
            </button>
          );
        })}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Panel version={SOUP} mode={mode} />
        <Panel version={SEMANTIC} mode={mode} />
      </div>

      {mode === "listen" && (
        <p className="spark-fade-up mt-5 border-t border-black/[0.07] pt-4 text-[13.5px] leading-[1.65] text-[#44423e]">
          The left column is not reachable by keyboard at all. Three zeroes
          means a visitor who navigates by Tab, or who jumps between headings,
          or who opens the landmarks menu, finds nothing on the page. It looks
          finished and it is unusable.
        </p>
      )}
    </WidgetShell>
  );
}
