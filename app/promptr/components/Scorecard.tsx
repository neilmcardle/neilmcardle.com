// The scorecard — renders a RubricResponse as six dimension cards
// (one per rubric dimension) plus a literary summary line at the
// bottom. Each card has an inline "(Why this)" affordance that
// expands the matching lesson without leaving the page.
//
// Dimensions can arrive one at a time during streaming. We render what
// we have and leave placeholders for what's still missing, so the
// scorecard builds up in real time rather than appearing all at once.

import { useState } from "react";
import {
  RubricDimension,
  RubricSummary,
  DimensionKey,
  DIMENSIONS,
  CATEGORY_LABELS,
} from "../rubric";
import { LESSONS, Lesson } from "../lessons";

interface ScorecardProps {
  dimensions: Map<DimensionKey, RubricDimension>;
  summary: RubricSummary | null;
  isStreaming: boolean;
  error?: string | null;
}

const LESSON_MAP: Record<DimensionKey, Lesson> = LESSONS.reduce(
  (acc, lesson) => {
    acc[lesson.key] = lesson;
    return acc;
  },
  {} as Record<DimensionKey, Lesson>,
);

export default function Scorecard({
  dimensions,
  summary,
  isStreaming,
  error,
}: ScorecardProps) {
  const [expanded, setExpanded] = useState<DimensionKey | null>(null);
  const hasAny = dimensions.size > 0 || isStreaming || error;

  if (!hasAny) return null;

  return (
    <section style={{ padding: "32px 24px", maxWidth: 860, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-playfair)",
            fontWeight: 400,
            fontSize: 24,
            letterSpacing: "-0.015em",
            color: "rgba(0,0,0,0.85)",
            margin: 0,
          }}
        >
          Scorecard
        </h2>
        {isStreaming && (
          <span
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: 12,
              color: "rgba(0,0,0,0.4)",
            }}
          >
            Reading…
          </span>
        )}
      </div>

      <div
        style={{
          background: "#fff",
          border: "1px solid rgba(0,0,0,0.08)",
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0 0 0 1px rgba(0,0,0,0.02), 0 1px 4px rgba(0,0,0,0.04)",
        }}
      >
        {DIMENSIONS.map((d, idx) => {
          const entry = dimensions.get(d.key);
          const lesson = LESSON_MAP[d.key];
          const isExpanded = expanded === d.key;
          return (
            <div
              key={d.key}
              style={{
                padding: "18px 20px",
                borderBottom: idx === DIMENSIONS.length - 1 ? "none" : "1px solid rgba(0,0,0,0.06)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
                <span
                  style={{
                    fontFamily: "var(--font-inter)",
                    fontSize: 14,
                    fontWeight: 500,
                    color: "rgba(0,0,0,0.82)",
                  }}
                >
                  {d.label}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <ScoreDots value={entry?.score ?? null} />
                  <span
                    style={{
                      fontFamily: "var(--font-inter)",
                      fontSize: 12,
                      fontVariantNumeric: "tabular-nums",
                      color: "rgba(0,0,0,0.5)",
                      minWidth: 28,
                      textAlign: "right",
                    }}
                  >
                    {entry ? `${entry.score}/5` : "—"}
                  </span>
                </span>
              </div>
              {entry && (
                <div style={{ marginTop: 8 }}>
                  <p
                    style={{
                      fontFamily: "var(--font-inter)",
                      fontSize: 13,
                      lineHeight: 1.55,
                      color: "rgba(0,0,0,0.65)",
                      margin: 0,
                    }}
                  >
                    {entry.explanation}
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--font-inter)",
                      fontSize: 13,
                      lineHeight: 1.55,
                      color: "rgba(0,0,0,0.55)",
                      margin: "6px 0 0",
                    }}
                  >
                    <span style={{ color: "rgba(0,0,0,0.4)", fontWeight: 500 }}>Fix: </span>
                    {entry.improvement}{" "}
                    <button
                      onClick={() => setExpanded(isExpanded ? null : d.key)}
                      style={{
                        fontFamily: "var(--font-inter)",
                        fontSize: 12,
                        color: "rgba(0,0,0,0.4)",
                        background: "none",
                        border: "none",
                        padding: 0,
                        cursor: "pointer",
                        textDecoration: "underline",
                        textUnderlineOffset: 2,
                      }}
                    >
                      {isExpanded ? "Hide" : "(Why this)"}
                    </button>
                  </p>
                  {isExpanded && lesson && (
                    <div
                      style={{
                        marginTop: 12,
                        padding: 14,
                        background: "rgba(0,0,0,0.02)",
                        borderRadius: 10,
                        border: "1px solid rgba(0,0,0,0.04)",
                      }}
                    >
                      <p
                        style={{
                          fontFamily: "var(--font-inter)",
                          fontSize: 13,
                          lineHeight: 1.55,
                          color: "rgba(0,0,0,0.7)",
                          margin: "0 0 10px",
                        }}
                      >
                        {lesson.body}
                      </p>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                        <ExampleBlock label="Before" text={lesson.before} tone="weak" />
                        <ExampleBlock label="After" text={lesson.after} tone="strong" />
                      </div>
                      <p
                        style={{
                          fontFamily: "var(--font-inter)",
                          fontSize: 12,
                          color: "rgba(0,0,0,0.5)",
                          fontStyle: "italic",
                          marginTop: 10,
                          marginBottom: 0,
                        }}
                      >
                        {lesson.whyItMatters}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {summary && (
        <div
          style={{
            marginTop: 20,
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-playfair)",
              fontSize: 20,
              lineHeight: 1.35,
              color: "rgba(0,0,0,0.78)",
              margin: 0,
              flex: 1,
            }}
          >
            {summary.headline}
          </p>
          <span
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: 13,
              fontVariantNumeric: "tabular-nums",
              color: "rgba(0,0,0,0.45)",
              whiteSpace: "nowrap",
            }}
          >
            {summary.total}/30 · {CATEGORY_LABELS[summary.category]}
          </span>
        </div>
      )}

      {error && (
        <p
          style={{
            fontFamily: "var(--font-inter)",
            fontSize: 13,
            color: "#c53030",
            marginTop: 16,
          }}
        >
          {error}
        </p>
      )}
    </section>
  );
}

function ScoreDots({ value }: { value: number | null }) {
  // Five small circles, filled from left to right based on score.
  // When streaming and no score yet, render all empty.
  const v = value ?? 0;
  return (
    <span style={{ display: "inline-flex", gap: 3 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: i <= v ? "rgba(0,0,0,0.82)" : "rgba(0,0,0,0.12)",
            transition: "background 0.2s",
          }}
        />
      ))}
    </span>
  );
}

function ExampleBlock({ label, text, tone }: { label: string; text: string; tone: "weak" | "strong" }) {
  return (
    <div
      style={{
        padding: 10,
        background: "#fff",
        borderRadius: 8,
        border: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-inter)",
          fontSize: 10,
          fontWeight: 500,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: tone === "weak" ? "rgba(0,0,0,0.35)" : "rgba(0,0,0,0.55)",
          margin: "0 0 6px",
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontFamily: "var(--font-inter)",
          fontSize: 12,
          lineHeight: 1.5,
          color: "rgba(0,0,0,0.7)",
          margin: 0,
        }}
      >
        {text}
      </p>
    </div>
  );
}
