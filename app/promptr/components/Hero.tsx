// Hero section for Promptr — the brand moment.
//
// Magazine-style two-column layout: title + copy on the left, the
// blacksmith illustration on the right as a discrete editorial element
// (not a ghosted background). On narrow viewports the image moves
// above the title so it still leads the composition.
//
// Typography:
//   - "Promptr" wordmark in Zilla Slab — the workshop-sign logo
//   - Italic Playfair subtitle
//   - Inter body line for the what-it-does

export default function Hero() {
  return (
    <section
      style={{
        padding: "64px 24px 40px",
        maxWidth: 860,
        margin: "0 auto",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        {/* Left column: wordmark + copy */}
        <div style={{ flex: "1 1 360px", minWidth: 0 }}>
          <h1
            style={{
              fontFamily: "var(--font-zilla-slab)",
              fontWeight: 700,
              fontSize: "clamp(64px, 11vw, 128px)",
              lineHeight: 0.88,
              letterSpacing: "-0.03em",
              color: "rgba(0,0,0,0.92)",
              margin: 0,
            }}
          >
            Promptr
          </h1>
          <p
            style={{
              fontFamily: "var(--font-playfair)",
              fontWeight: 400,
              fontSize: "clamp(22px, 3.2vw, 30px)",
              lineHeight: 1.2,
              letterSpacing: "-0.015em",
              color: "rgba(0,0,0,0.6)",
              marginTop: 16,
              marginBottom: 0,
              fontStyle: "italic",
            }}
          >
            Your prompt workshop.
          </p>
        </div>

        {/* Right column: blacksmith illustration, full colour, rounded,
            sized like a magazine feature image beside the headline.
            Aspect preserved; max width keeps it from dominating. */}
        <div
          style={{
            flex: "0 0 auto",
            width: "clamp(180px, 28vw, 240px)",
          }}
        >
          <img
            src="/promptr.png"
            alt="A blacksmith hammering a blade on an anvil, sparks flying"
            style={{
              width: "100%",
              height: "auto",
              display: "block",
              borderRadius: 16,
              border: "1px solid rgba(0,0,0,0.08)",
              boxShadow:
                "0 1px 2px rgba(0,0,0,0.04), 0 8px 24px -12px rgba(0,0,0,0.18)",
            }}
          />
        </div>
      </div>
    </section>
  );
}
