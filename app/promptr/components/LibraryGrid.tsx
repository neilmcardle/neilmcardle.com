// The curated prompt library — filter bar + card grid. Each card
// exposes Copy (clipboard) and Load (replace the editor content).
// Library stays mounted at the bottom of the page so users can move
// between refining their own prompt and browsing examples.

import { useMemo, useState } from "react";
import { LIBRARY, LibraryCategory, CATEGORY_LABELS, LibraryPrompt } from "../library";

interface LibraryGridProps {
  onCopy: (prompt: LibraryPrompt) => void;
  onLoad: (prompt: LibraryPrompt) => void;
}

const CATEGORIES: Array<LibraryCategory | "all"> = [
  "all",
  "writing",
  "analysis",
  "research",
  "code",
  "brainstorm",
  "meta",
];

const CATEGORY_LABEL_MAP: Record<LibraryCategory | "all", string> = {
  all: "All",
  ...CATEGORY_LABELS,
};

export default function LibraryGrid({ onCopy, onLoad }: LibraryGridProps) {
  const [active, setActive] = useState<LibraryCategory | "all">("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (active === "all") return LIBRARY;
    return LIBRARY.filter((p) => p.category === active);
  }, [active]);

  const handleCopy = (p: LibraryPrompt) => {
    onCopy(p);
    setCopiedId(p.id);
    setTimeout(() => setCopiedId((c) => (c === p.id ? null : c)), 1500);
  };

  return (
    <section style={{ padding: "48px 24px 64px", maxWidth: 860, margin: "0 auto" }}>
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
          Library
        </h2>
        <p
          style={{
            fontFamily: "var(--font-inter)",
            fontSize: 14,
            color: "rgba(0,0,0,0.5)",
            margin: 0,
          }}
        >
          Curated prompts worth stealing. Tap Load to refine one here, or Copy to take it with you.
        </p>
      </div>

      <div
        style={{
          display: "flex",
          gap: 6,
          marginBottom: 20,
          flexWrap: "wrap",
        }}
      >
        {CATEGORIES.map((c) => {
          const isActive = active === c;
          return (
            <button
              key={c}
              onClick={() => setActive(c)}
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: 12,
                fontWeight: 500,
                padding: "6px 12px",
                borderRadius: 999,
                border: isActive ? "none" : "1px solid rgba(0,0,0,0.08)",
                background: isActive ? "#111" : "#fff",
                color: isActive ? "#fff" : "rgba(0,0,0,0.65)",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {CATEGORY_LABEL_MAP[c]}
            </button>
          );
        })}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 12,
        }}
      >
        {filtered.map((p) => (
          <div
            key={p.id}
            style={{
              background: "#fff",
              border: "1px solid rgba(0,0,0,0.08)",
              borderRadius: 12,
              padding: 16,
              display: "flex",
              flexDirection: "column",
              minHeight: 140,
              boxShadow: "0 0 0 1px rgba(0,0,0,0.02)",
              transition: "border-color 0.15s",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: 10,
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "rgba(0,0,0,0.35)",
                marginBottom: 8,
              }}
            >
              {CATEGORY_LABELS[p.category]}
            </span>
            <h3
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: 15,
                fontWeight: 500,
                color: "rgba(0,0,0,0.82)",
                margin: "0 0 6px",
              }}
            >
              {p.title}
            </h3>
            <p
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: 12,
                lineHeight: 1.5,
                color: "rgba(0,0,0,0.55)",
                margin: "0 0 16px",
                flex: 1,
              }}
            >
              {p.description}
            </p>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                onClick={() => onLoad(p)}
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: 12,
                  fontWeight: 500,
                  padding: "7px 12px",
                  borderRadius: 8,
                  border: "none",
                  background: "#111",
                  color: "#fff",
                  cursor: "pointer",
                  flex: 1,
                }}
              >
                Load
              </button>
              <button
                onClick={() => handleCopy(p)}
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: 12,
                  fontWeight: 500,
                  padding: "7px 12px",
                  borderRadius: 8,
                  border: "1px solid rgba(0,0,0,0.1)",
                  background: "#fff",
                  color: "rgba(0,0,0,0.7)",
                  cursor: "pointer",
                  flex: 1,
                }}
              >
                {copiedId === p.id ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
