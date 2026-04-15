// The "How great prompts work" section — six expandable lesson cards,
// one per rubric dimension. Lives below the scorecard as the standalone
// education surface. The same lesson data is reused inside Scorecard
// for the inline "(Why this)" expansion, so users can read the lessons
// here on first visit or discover them through the scorecard later.

import { useState } from "react";
import { LESSONS } from "../lessons";
import type { DimensionKey } from "../rubric";

export default function LessonCards() {
  const [expanded, setExpanded] = useState<DimensionKey | null>(null);

  return (
    <section style={{ padding: "32px 24px", maxWidth: 860, margin: "0 auto" }}>
      <div style={{ marginBottom: 20 }}>
        <h2
          style={{
            fontFamily: "var(--font-playfair)",
            fontWeight: 400,
            fontSize: 28,
            letterSpacing: "-0.015em",
            color: "rgba(0,0,0,0.85)",
            margin: "0 0 8px",
          }}
        >
          How great prompts work
        </h2>
        <p
          style={{
            fontFamily: "var(--font-inter)",
            fontSize: 14,
            color: "rgba(0,0,0,0.5)",
            margin: 0,
          }}
        >
          Six dimensions the scorecard uses. Tap any card for a worked example.
        </p>
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        {LESSONS.map((lesson) => {
          const isOpen = expanded === lesson.key;
          return (
            <div
              key={lesson.key}
              style={{
                background: "#fff",
                border: "1px solid rgba(0,0,0,0.08)",
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              <button
                onClick={() => setExpanded(isOpen ? null : lesson.key)}
                style={{
                  width: "100%",
                  padding: "16px 20px",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 16,
                  textAlign: "left",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-playfair)",
                    fontWeight: 400,
                    fontSize: 20,
                    letterSpacing: "-0.01em",
                    color: "rgba(0,0,0,0.85)",
                  }}
                >
                  {lesson.title}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-inter)",
                    fontSize: 12,
                    color: "rgba(0,0,0,0.4)",
                  }}
                >
                  {isOpen ? "Close" : "Read"}
                </span>
              </button>
              {isOpen && (
                <div
                  style={{
                    padding: "0 20px 20px",
                    borderTop: "1px solid rgba(0,0,0,0.04)",
                  }}
                >
                  <p
                    style={{
                      fontFamily: "var(--font-inter)",
                      fontSize: 14,
                      lineHeight: 1.6,
                      color: "rgba(0,0,0,0.7)",
                      margin: "16px 0 16px",
                    }}
                  >
                    {lesson.body}
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                    <div
                      style={{
                        padding: 12,
                        background: "rgba(0,0,0,0.02)",
                        borderRadius: 8,
                        border: "1px solid rgba(0,0,0,0.04)",
                      }}
                    >
                      <p
                        style={{
                          fontFamily: "var(--font-inter)",
                          fontSize: 10,
                          fontWeight: 500,
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                          color: "rgba(0,0,0,0.35)",
                          margin: "0 0 6px",
                        }}
                      >
                        Before
                      </p>
                      <p
                        style={{
                          fontFamily: "var(--font-inter)",
                          fontSize: 13,
                          lineHeight: 1.55,
                          color: "rgba(0,0,0,0.6)",
                          margin: 0,
                        }}
                      >
                        {lesson.before}
                      </p>
                    </div>
                    <div
                      style={{
                        padding: 12,
                        background: "rgba(0,0,0,0.02)",
                        borderRadius: 8,
                        border: "1px solid rgba(0,0,0,0.04)",
                      }}
                    >
                      <p
                        style={{
                          fontFamily: "var(--font-inter)",
                          fontSize: 10,
                          fontWeight: 500,
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                          color: "rgba(0,0,0,0.5)",
                          margin: "0 0 6px",
                        }}
                      >
                        After
                      </p>
                      <p
                        style={{
                          fontFamily: "var(--font-inter)",
                          fontSize: 13,
                          lineHeight: 1.55,
                          color: "rgba(0,0,0,0.72)",
                          margin: 0,
                        }}
                      >
                        {lesson.after}
                      </p>
                    </div>
                  </div>
                  <p
                    style={{
                      fontFamily: "var(--font-inter)",
                      fontSize: 12,
                      color: "rgba(0,0,0,0.5)",
                      fontStyle: "italic",
                      margin: 0,
                    }}
                  >
                    {lesson.whyItMatters}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
