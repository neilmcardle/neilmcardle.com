// Shows the model's refined version of the user's prompt, with a short
// list of what changed and three actions: Keep (replace the editor
// content with the refined version), Revert (discard the refined
// version and leave the editor alone), and Re-refine (ask for another
// pass). Rendered as a quiet card below the scorecard when a refine
// call completes.

import { RefineResponse } from "../rubric";

interface RefineResultProps {
  result: RefineResponse | null;
  isStreaming: boolean;
  error?: string | null;
  onKeep: () => void;
  onRevert: () => void;
  onRerun: () => void;
}

export default function RefineResult({
  result,
  isStreaming,
  error,
  onKeep,
  onRevert,
  onRerun,
}: RefineResultProps) {
  if (!result && !isStreaming && !error) return null;

  return (
    <section style={{ padding: "8px 24px 24px", maxWidth: 860, margin: "0 auto" }}>
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
          Refined version
        </h2>
        {isStreaming && (
          <span style={{ fontFamily: "var(--font-inter)", fontSize: 12, color: "rgba(0,0,0,0.4)" }}>
            Rewriting…
          </span>
        )}
      </div>

      {error && (
        <p style={{ fontFamily: "var(--font-inter)", fontSize: 13, color: "#c53030", margin: 0 }}>
          {error}
        </p>
      )}

      {result && (
        <>
          <div
            style={{
              background: "#fff",
              border: "1px solid rgba(0,0,0,0.08)",
              borderRadius: 16,
              padding: 20,
              boxShadow: "0 0 0 1px rgba(0,0,0,0.02), 0 1px 4px rgba(0,0,0,0.04)",
            }}
          >
            <pre
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: 14,
                lineHeight: 1.6,
                color: "rgba(0,0,0,0.82)",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                margin: 0,
              }}
            >
              {result.refined}
            </pre>
          </div>

          {result.changes.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <p
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: 11,
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "rgba(0,0,0,0.4)",
                  margin: "0 0 8px",
                }}
              >
                What changed
              </p>
              <ul
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: 13,
                  lineHeight: 1.55,
                  color: "rgba(0,0,0,0.65)",
                  margin: 0,
                  paddingLeft: 18,
                }}
              >
                {result.changes.map((c, i) => (
                  <li key={i} style={{ marginBottom: 4 }}>{c}</li>
                ))}
              </ul>
            </div>
          )}

          <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
            <button
              onClick={onKeep}
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: 13,
                fontWeight: 500,
                padding: "9px 18px",
                borderRadius: 10,
                border: "none",
                background: "#111",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              Keep this version
            </button>
            <button
              onClick={onRerun}
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: 13,
                fontWeight: 500,
                padding: "9px 16px",
                borderRadius: 10,
                border: "1px solid rgba(0,0,0,0.1)",
                background: "#fff",
                color: "rgba(0,0,0,0.75)",
                cursor: "pointer",
              }}
            >
              Try another take
            </button>
            <button
              onClick={onRevert}
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: 13,
                fontWeight: 500,
                padding: "9px 16px",
                borderRadius: 10,
                border: "none",
                background: "transparent",
                color: "rgba(0,0,0,0.5)",
                cursor: "pointer",
              }}
            >
              Discard
            </button>
          </div>
        </>
      )}
    </section>
  );
}
