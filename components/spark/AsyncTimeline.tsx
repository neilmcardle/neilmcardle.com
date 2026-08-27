"use client";

import React, { useState } from "react";
import { WidgetShell } from "./WidgetShell";

type Track = "main" | "network";

interface Event {
  at: number;
  span: number;
  track: Track;
  label: string;
  note: string;
}

const WITH_AWAIT: Event[] = [
  {
    at: 0,
    span: 4,
    track: "main",
    label: "loadUser() called",
    note: "The function starts running on the main thread, like any other function.",
  },
  {
    at: 4,
    span: 4,
    track: "main",
    label: "fetch(url) called",
    note: "fetch does not wait. It starts the request and immediately hands back a Promise.",
  },
  {
    at: 8,
    span: 52,
    track: "network",
    label: "request in flight",
    note: "The network is doing the work. This is the slow part, and none of it is your code.",
  },
  {
    at: 8,
    span: 30,
    track: "main",
    label: "the page stays responsive",
    note: "The main thread is free. Buttons still click, animations still run, the tab is not frozen.",
  },
  {
    at: 60,
    span: 5,
    track: "main",
    label: "await resumes",
    note: "The response arrived, so the function picks up exactly where it stopped, with the data.",
  },
  {
    at: 65,
    span: 6,
    track: "main",
    label: "render(user)",
    note: "Now you have the user object and can put it on screen.",
  },
];

const WITHOUT_AWAIT: Event[] = [
  {
    at: 0,
    span: 4,
    track: "main",
    label: "loadUser() called",
    note: "Identical so far.",
  },
  {
    at: 4,
    span: 4,
    track: "main",
    label: "fetch(url) called",
    note: "Still returns a Promise immediately.",
  },
  {
    at: 8,
    span: 52,
    track: "network",
    label: "request in flight",
    note: "The request still happens. Nothing is waiting for it.",
  },
  {
    at: 8,
    span: 6,
    track: "main",
    label: "render(user)",
    note: "This runs now, not later. user is a Promise object, not your data.",
  },
  {
    at: 14,
    span: 6,
    track: "main",
    label: "undefined on screen",
    note: "You render user.name off a Promise, which has no name property. The page shows undefined and no error is thrown.",
  },
];

const SPAN = 78;

export function AsyncTimeline() {
  const [awaited, setAwaited] = useState(true);
  const [picked, setPicked] = useState<number | null>(null);

  const events = awaited ? WITH_AWAIT : WITHOUT_AWAIT;
  const active = picked === null ? null : events[picked];

  const code = awaited
    ? `async function loadUser(id) {
  const response = await fetch(url);
  const user = await response.json();
  render(user);
}`
    : `async function loadUser(id) {
  const response = fetch(url);
  const user = response.json();
  render(user);
}`;

  return (
    <WidgetShell
      title="The code reads top to bottom. It does not run that way."
      status={awaited ? "with await" : "await removed"}
      onReset={
        picked === null && awaited
          ? undefined
          : () => {
              setAwaited(true);
              setPicked(null);
            }
      }
      caption="Click any bar to see what is happening at that moment. The network track is time you do not control, and the main thread is time you do."
    >
      <div
        role="group"
        aria-label="Version"
        className="mb-4 inline-flex rounded-full p-1"
        style={{ background: "rgba(20,20,19,0.055)" }}
      >
        {[
          { on: true, label: "With await" },
          { on: false, label: "Without await" },
        ].map((option) => {
          const on = awaited === option.on;
          return (
            <button
              key={option.label}
              type="button"
              onClick={() => {
                setAwaited(option.on);
                setPicked(null);
              }}
              aria-pressed={on}
              className="min-h-[36px] rounded-full px-4 text-[12.5px] font-semibold transition-colors"
              style={{
                background: on ? "var(--spark-ink)" : "transparent",
                color: on ? "#fff" : "var(--spark-muted)",
              }}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <pre className="spark-mono mb-5 overflow-x-auto rounded-lg bg-[var(--spark-ink)] p-3.5 text-[12px] leading-[1.75] text-[var(--spark-on-dark)]">
        <code>{code}</code>
      </pre>

      {(["main", "network"] as Track[]).map((track) => (
        <div key={track} className="mb-3">
          <span className="spark-eyebrow mb-1.5 block text-[var(--spark-faint)]">
            {track === "main"
              ? "Main thread, your code"
              : "Network, not your code"}
          </span>
          <div
            className="relative rounded-lg"
            style={{ height: 34, background: "rgba(20,20,19,0.04)" }}
          >
            {events.map((event, i) =>
              event.track !== track ? null : (
                <button
                  key={i}
                  type="button"
                  onClick={() => setPicked(picked === i ? null : i)}
                  aria-label={event.label}
                  className="absolute top-[5px] h-[24px] rounded transition-all"
                  style={{
                    left: `${(event.at / SPAN) * 100}%`,
                    width: `${(event.span / SPAN) * 100}%`,
                    background:
                      picked === i
                        ? "var(--spark-gold)"
                        : track === "network"
                          ? "rgba(20,20,19,0.22)"
                          : "var(--spark-gold-deep)",
                    outline:
                      picked === i ? "2px solid var(--spark-gold-ink)" : "none",
                    outlineOffset: 1,
                  }}
                />
              ),
            )}
          </div>
        </div>
      ))}

      <div className="mt-3 min-h-[4em] rounded-lg border border-dashed border-[var(--spark-gold)]/40 bg-[var(--spark-gold)]/[0.07] px-3.5 py-3">
        {active ? (
          <p className="text-[13px] leading-[1.65] text-[#44423e]">
            <span className="spark-eyebrow mr-2 text-[var(--spark-gold-ink)]">
              {active.label}
            </span>
            {active.note}
          </p>
        ) : (
          <p className="text-[13px] leading-[1.65] text-[var(--spark-faint)]">
            Click a bar on either track.
          </p>
        )}
      </div>

      {!awaited && (
        <p className="spark-fade-up mt-4 border-t border-black/[0.07] pt-4 text-[13.5px] leading-[1.65] text-[#44423e]">
          Nothing here throws. The function returns, the page renders, and the
          value is <code className="spark-inline-code">undefined</code>. This is
          the most common async bug there is, and the reason it is hard to find
          is that the code looks correct and the console stays quiet.
        </p>
      )}
    </WidgetShell>
  );
}
