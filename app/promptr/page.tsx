"use client";

// Promptr page — the top-level shell for the prompt workshop tool.
//
// Layout grammar mirrors icon-animator: full-viewport standalone tool,
// own layout.tsx, minimal 48px sticky header (back arrow → "/" + dot
// separator + tool name + inline action slot), scrollable body below.
// Inline-styled throughout so the design language matches the other
// portfolio tools without importing a new component system.
//
// State ownership sits here. The two API endpoints (score / refine) are
// called from this component, streaming results flow into useState, and
// child components are pure renderers over that state.

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import Hero from "./components/Hero";
import PromptEditor from "./components/PromptEditor";
import Scorecard from "./components/Scorecard";
import RefineResult from "./components/RefineResult";
import LibraryGrid from "./components/LibraryGrid";
import LessonCards from "./components/LessonCards";
import {
  RubricDimension,
  RubricSummary,
  DimensionKey,
  RefineResponse,
  categoryFor,
  CATEGORY_HEADLINES,
} from "./rubric";
import type { LibraryPrompt } from "./library";

export default function PromptrPage() {
  const [prompt, setPrompt] = useState("");

  // Scorecard state. `dimensions` is a map so we can populate
  // incrementally as the NDJSON stream arrives.
  const [dimensions, setDimensions] = useState<Map<DimensionKey, RubricDimension>>(new Map());
  const [summary, setSummary] = useState<RubricSummary | null>(null);
  const [scoreError, setScoreError] = useState<string | null>(null);
  const [isScoring, setIsScoring] = useState(false);

  // Refine state. The refined prompt is buffered in full before we
  // parse it; we don't render partial JSON.
  const [refineResult, setRefineResult] = useState<RefineResponse | null>(null);
  const [refineError, setRefineError] = useState<string | null>(null);
  const [isRefining, setIsRefining] = useState(false);

  // Toast for copy feedback from library cards. Tiny and ephemeral,
  // rendered by the page shell so any component can trigger it.
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 1600);
  }, []);

  // Clear previous scorecard state before starting a new scoring run.
  // The stream populates dimensions one at a time; we don't want stale
  // entries from the last run lingering.
  const resetScore = () => {
    setDimensions(new Map());
    setSummary(null);
    setScoreError(null);
  };

  // ─── Score handler ─────────────────────────────────────────────────
  const handleScore = useCallback(async () => {
    if (!prompt.trim() || isScoring) return;
    resetScore();
    setIsScoring(true);

    try {
      const response = await fetch("/api/promptr/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? `Request failed with status ${response.status}`);
      }
      if (!response.body) throw new Error("No response body");

      // Parse NDJSON incrementally. Lines may be split across chunks,
      // so we buffer and split on newlines each time.
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          try {
            const parsed = JSON.parse(trimmed);
            if (parsed.type === "error") {
              throw new Error(parsed.error ?? "Scoring failed");
            }
            if (parsed.type === "dimension" && parsed.key) {
              setDimensions((prev) => {
                const next = new Map(prev);
                next.set(parsed.key, {
                  key: parsed.key,
                  label: parsed.label ?? parsed.key,
                  score: typeof parsed.score === "number" ? parsed.score : 0,
                  explanation: String(parsed.explanation ?? ""),
                  improvement: String(parsed.improvement ?? ""),
                });
                return next;
              });
            }
            if (parsed.type === "summary") {
              // Model may send a category we don't recognise; normalise
              // via our own bucketing so the UI never gets a stray value.
              const totalRaw = typeof parsed.total === "number" ? parsed.total : 0;
              const safeCategory = categoryFor(totalRaw);
              setSummary({
                total: totalRaw,
                category: safeCategory,
                headline: String(parsed.headline ?? CATEGORY_HEADLINES[safeCategory]),
              });
            }
          } catch (e) {
            // Skip malformed lines silently; a broken dimension just
            // leaves its placeholder in the UI.
            if (e instanceof Error && e.message !== "Unexpected token") {
              // Real error → propagate
              throw e;
            }
          }
        }
      }

      // Flush any trailing line that didn't end with \n
      const trailing = buffer.trim();
      if (trailing) {
        try {
          const parsed = JSON.parse(trailing);
          if (parsed.type === "summary") {
            const totalRaw = typeof parsed.total === "number" ? parsed.total : 0;
            const safeCategory = categoryFor(totalRaw);
            setSummary({
              total: totalRaw,
              category: safeCategory,
              headline: String(parsed.headline ?? CATEGORY_HEADLINES[safeCategory]),
            });
          }
        } catch { /* ignore */ }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Scoring failed";
      setScoreError(message);
    } finally {
      setIsScoring(false);
    }
  }, [prompt, isScoring]);

  // ─── Refine handler ────────────────────────────────────────────────
  const handleRefine = useCallback(async () => {
    if (!prompt.trim() || isRefining) return;
    setRefineResult(null);
    setRefineError(null);
    setIsRefining(true);

    try {
      const response = await fetch("/api/promptr/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? `Request failed with status ${response.status}`);
      }
      if (!response.body) throw new Error("No response body");

      // Refine streams raw text; we buffer the whole thing and JSON.parse
      // at the end. Sonnet usually returns < 1500 chars so there's no
      // meaningful interactivity lost vs. incremental parsing.
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
      }

      const parsed = extractJson(full);
      if (!parsed) throw new Error("Could not parse the model's response");
      if (parsed.error) throw new Error(String(parsed.error));
      if (typeof parsed.refined !== "string" || !parsed.refined.trim()) {
        throw new Error("The model did not return a refined prompt");
      }
      setRefineResult({
        refined: parsed.refined,
        changes: Array.isArray(parsed.changes)
          ? parsed.changes.filter((c: unknown): c is string => typeof c === "string").slice(0, 5)
          : [],
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Refine failed";
      setRefineError(message);
    } finally {
      setIsRefining(false);
    }
  }, [prompt, isRefining]);

  // Accept the refined version: replace the editor content with the
  // refined prompt and clear the refine card. User can immediately
  // re-score to see the new number.
  const handleKeepRefine = () => {
    if (!refineResult) return;
    setPrompt(refineResult.refined);
    setRefineResult(null);
    resetScore();
  };

  const handleRevertRefine = () => {
    setRefineResult(null);
  };

  // Library copy — write to clipboard and trigger a toast.
  const handleLibraryCopy = useCallback(
    async (item: LibraryPrompt) => {
      try {
        await navigator.clipboard.writeText(item.prompt);
        showToast(`Copied "${item.title}"`);
      } catch {
        showToast("Clipboard unavailable");
      }
    },
    [showToast],
  );

  // Library load — replace the editor contents, clear any existing
  // scorecard, and scroll back up so the user sees what they just loaded.
  const handleLibraryLoad = useCallback(
    (item: LibraryPrompt) => {
      setPrompt(item.prompt);
      resetScore();
      setRefineResult(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
      showToast(`Loaded "${item.title}"`);
    },
    [showToast],
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8f8f7",
        fontFamily: "var(--font-inter)",
      }}
    >
      {/* ─── Header ─────────────────────────────────────────────────── */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          height: 48,
          borderBottom: "1px solid rgba(0,0,0,0.06)",
          background: "rgba(248,248,247,0.92)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link
            href="/"
            style={{
              color: "rgba(0,0,0,0.3)",
              display: "flex",
              transition: "color 0.15s",
            }}
            aria-label="Back to neilmcardle.com"
            onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(0,0,0,0.7)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(0,0,0,0.3)")}
          >
            <svg
              width="14"
              height="14"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </Link>
          <span style={{ color: "rgba(0,0,0,0.12)" }}>·</span>
          <span
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: 13,
              fontWeight: 500,
              color: "rgba(0,0,0,0.7)",
              letterSpacing: "-0.01em",
            }}
          >
            Promptr
          </span>
        </div>
      </header>

      {/* ─── Body ───────────────────────────────────────────────────── */}
      <main>
        <Hero />
        <PromptEditor
          value={prompt}
          onChange={setPrompt}
          onScore={handleScore}
          onRefine={handleRefine}
          isScoring={isScoring}
          isRefining={isRefining}
        />
        <Scorecard
          dimensions={dimensions}
          summary={summary}
          isStreaming={isScoring}
          error={scoreError}
        />
        <RefineResult
          result={refineResult}
          isStreaming={isRefining}
          error={refineError}
          onKeep={handleKeepRefine}
          onRevert={handleRevertRefine}
          onRerun={handleRefine}
        />
        <LessonCards />
        <LibraryGrid onCopy={handleLibraryCopy} onLoad={handleLibraryLoad} />

        <footer
          style={{
            padding: "24px 24px 48px",
            textAlign: "center",
            fontFamily: "var(--font-inter)",
            fontSize: 12,
            color: "rgba(0,0,0,0.35)",
          }}
        >
          Made by{" "}
          <a
            href="/"
            style={{
              color: "rgba(0,0,0,0.55)",
              textDecoration: "underline",
              textUnderlineOffset: 2,
            }}
          >
            Neil McArdle
          </a>
        </footer>
      </main>

      {/* ─── Toast ──────────────────────────────────────────────────── */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#111",
            color: "#fff",
            fontFamily: "var(--font-inter)",
            fontSize: 13,
            padding: "10px 16px",
            borderRadius: 10,
            boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
            zIndex: 100,
            pointerEvents: "none",
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}

// Best-effort JSON extraction for the refine endpoint's response. The
// model is instructed to return a single JSON object, but we still
// guard against leading/trailing whitespace and stray prose by scanning
// for the first '{' and the matching last '}'.
function extractJson(text: string): Record<string, unknown> | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  // Fast path: already valid JSON
  try {
    return JSON.parse(trimmed);
  } catch {
    // Fall through to the scan
  }

  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace <= firstBrace) return null;

  try {
    return JSON.parse(trimmed.slice(firstBrace, lastBrace + 1));
  } catch {
    return null;
  }
}
