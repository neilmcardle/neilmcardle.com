"use client";

import React, { useState } from "react";
import { WidgetShell } from "./WidgetShell";

const POSTS = 20;

export function NPlusOneWaterfall() {
  const [latency, setLatency] = useState(8);

  const naiveQueries = POSTS + 1;
  const joinQueries = 1;
  const naiveMs = naiveQueries * latency;
  const joinMs = joinQueries * latency;
  const factor = naiveMs / joinMs;

  const bars = Math.min(naiveQueries, 21);

  return (
    <WidgetShell
      title="Twenty one queries, or one"
      status={`${factor.toFixed(0)}x slower`}
      onReset={latency === 8 ? undefined : () => setLatency(8)}
      caption="Both versions return the same posts with the same authors. The loop looks completely reasonable in the editor, which is the entire problem."
    >
      <label className="mb-5 block">
        <span className="mb-1 flex items-baseline justify-between gap-2">
          <span className="spark-eyebrow text-[var(--spark-faint)]">
            Round trip to the database
          </span>
          <span className="spark-mono text-[11px] tabular-nums text-[var(--spark-text)]">
            {latency}ms
          </span>
        </span>
        <input
          type="range"
          min={1}
          max={60}
          step={1}
          value={latency}
          onChange={(event) => setLatency(Number(event.target.value))}
          className="w-full accent-[var(--spark-gold-deep)]"
        />
        <span className="mt-1 block text-[12px] leading-[1.55] text-[var(--spark-faint)]">
          {latency <= 3
            ? "A database on your own machine. This is why the bug survives local testing."
            : latency <= 20
              ? "A managed database in the same region. Typical production."
              : "A database across regions, or a busy one. The gap becomes unmissable."}
        </span>
      </label>

      <div className="grid gap-5 sm:grid-cols-2">
        <Panel
          label="A loop"
          code={`const posts = await db.posts.findMany();

for (const post of posts) {
  post.author = await db.users.find(
    post.authorId
  );
}`}
          queries={naiveQueries}
          ms={naiveMs}
          bars={bars}
          truncated={naiveQueries > bars}
          bad
        />
        <Panel
          label="A join"
          code={`const posts = await db.posts.findMany({
  include: { author: true },
});`}
          queries={joinQueries}
          ms={joinMs}
          bars={1}
          truncated={false}
        />
      </div>

      <p className="mt-5 border-t border-black/[0.07] pt-4 text-[13.5px] leading-[1.65] text-[#44423e]">
        This is called an N+1 query: one query for the list, then N more, one
        per row. It scales with your data, so it is fastest on the day you write
        it and slowest on the day the product succeeds. Nothing in the loop
        looks wrong, which is why you have to look for it deliberately rather
        than wait for it to announce itself.
      </p>
    </WidgetShell>
  );
}

function Panel({
  label,
  code,
  queries,
  ms,
  bars,
  truncated,
  bad = false,
}: {
  label: string;
  code: string;
  queries: number;
  ms: number;
  bars: number;
  truncated: boolean;
  bad?: boolean;
}) {
  return (
    <div className="min-w-0">
      <span className="spark-eyebrow mb-2 block text-[var(--spark-text)]">
        {label}
      </span>

      <pre className="spark-mono mb-3 overflow-x-auto rounded-lg bg-[var(--spark-ink)] p-3 text-[11px] leading-[1.7] text-[var(--spark-on-dark)]">
        <code>{code}</code>
      </pre>

      <div className="flex flex-col gap-[3px]">
        {Array.from({ length: bars }, (_, i) => (
          <div
            key={i}
            className="h-[6px] rounded-sm"
            style={{
              width: `${Math.max(12, 100 - i * 3)}%`,
              marginLeft: `${Math.min(i * 3.4, 62)}%`,
              background: bad
                ? "rgba(184,84,58,0.55)"
                : "var(--spark-gold-deep)",
            }}
          />
        ))}
        {truncated && (
          <span className="spark-mono mt-1 text-[10.5px] text-[var(--spark-faint)]">
            and the rest
          </span>
        )}
      </div>

      <div className="mt-3 flex gap-2">
        <Stat value={String(queries)} label="Queries" bad={bad} />
        <Stat value={`${ms}ms`} label="Waiting" bad={bad} />
      </div>
    </div>
  );
}

function Stat({
  value,
  label,
  bad,
}: {
  value: string;
  label: string;
  bad: boolean;
}) {
  return (
    <div
      className="flex-1 rounded-md px-2.5 py-2 text-center"
      style={{
        background: bad ? "rgba(184,84,58,0.09)" : "rgba(216,180,106,0.14)",
      }}
    >
      <div
        className="spark-mono text-[15px] font-semibold tabular-nums"
        style={{ color: bad ? "#b8543a" : "var(--spark-gold-ink)" }}
      >
        {value}
      </div>
      <div className="spark-eyebrow mt-0.5 text-[9.5px] text-[var(--spark-faint)]">
        {label}
      </div>
    </div>
  );
}
