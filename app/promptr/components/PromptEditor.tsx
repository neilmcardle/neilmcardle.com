// The prompt editor — large auto-growing textarea + a helper row with
// the character count and primary actions. Kept visually quiet so the
// prompt itself is the main thing on the page.

import { useEffect, useRef } from "react";

interface PromptEditorProps {
  value: string;
  onChange: (value: string) => void;
  onScore: () => void;
  onRefine: () => void;
  isScoring: boolean;
  isRefining: boolean;
  disabled?: boolean;
}

const MAX_CHARS = 8000;

export default function PromptEditor({
  value,
  onChange,
  onScore,
  onRefine,
  isScoring,
  isRefining,
  disabled,
}: PromptEditorProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  // Auto-grow: clear the height first, then set to scrollHeight so the
  // textarea matches the content exactly. Capped at 600px so very long
  // prompts scroll inside the box instead of eating the page.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 600) + "px";
  }, [value]);

  const tooShort = value.trim().length < 12;
  const overLimit = value.length > MAX_CHARS;
  const busy = isScoring || isRefining;

  return (
    <section style={{ padding: "8px 24px 24px", maxWidth: 860, margin: "0 auto" }}>
      <div
        style={{
          background: "#fff",
          border: "1px solid rgba(0,0,0,0.08)",
          borderRadius: 16,
          padding: 20,
          boxShadow: "0 0 0 1px rgba(0,0,0,0.02), 0 1px 4px rgba(0,0,0,0.04)",
          transition: "border-color 0.15s",
        }}
      >
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste or type your prompt here. Any draft will do. Hit Score to see where it stands."
          disabled={disabled || busy}
          style={{
            width: "100%",
            minHeight: 160,
            maxHeight: 600,
            border: "none",
            outline: "none",
            resize: "none",
            background: "transparent",
            fontFamily: "var(--font-inter)",
            fontSize: 16,
            lineHeight: 1.6,
            color: "rgba(0,0,0,0.82)",
            padding: 0,
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 16,
            paddingTop: 16,
            borderTop: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: 12,
              color: overLimit ? "#c53030" : "rgba(0,0,0,0.4)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {value.length.toLocaleString()} / {MAX_CHARS.toLocaleString()} characters
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={onRefine}
              disabled={busy || tooShort || overLimit}
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: 13,
                fontWeight: 500,
                padding: "9px 16px",
                borderRadius: 10,
                border: "1px solid rgba(0,0,0,0.1)",
                background: "#fff",
                color: tooShort || overLimit || busy ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.75)",
                cursor: tooShort || overLimit || busy ? "not-allowed" : "pointer",
                transition: "all 0.15s",
              }}
            >
              {isRefining ? "Refining…" : "Refine for me"}
            </button>
            <button
              onClick={onScore}
              disabled={busy || tooShort || overLimit}
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: 13,
                fontWeight: 500,
                padding: "9px 18px",
                borderRadius: 10,
                border: "none",
                background: tooShort || overLimit || busy ? "rgba(0,0,0,0.12)" : "#111",
                color: tooShort || overLimit || busy ? "rgba(0,0,0,0.4)" : "#fff",
                cursor: tooShort || overLimit || busy ? "not-allowed" : "pointer",
                transition: "all 0.15s",
              }}
            >
              {isScoring ? "Scoring…" : "Score my prompt"}
            </button>
          </div>
        </div>
      </div>
      {tooShort && value.length > 0 && (
        <p style={{ fontFamily: "var(--font-inter)", fontSize: 12, color: "rgba(0,0,0,0.4)", marginTop: 8, marginLeft: 4 }}>
          Give it a little more to work with. Twelve characters or so.
        </p>
      )}
    </section>
  );
}
