// Hero section for Promptr — Playfair display, terse, literary.
// Sits at the top of the body, above the editor, framing the product.

export default function Hero() {
  return (
    <section style={{ padding: "80px 24px 32px", maxWidth: 860, margin: "0 auto" }}>
      <h1
        style={{
          fontFamily: "var(--font-playfair)",
          fontWeight: 400,
          fontSize: "clamp(40px, 6vw, 64px)",
          lineHeight: 1.05,
          letterSpacing: "-0.025em",
          color: "rgba(0,0,0,0.88)",
          margin: 0,
        }}
      >
        A workshop for your first draft.
      </h1>
      <p
        style={{
          fontFamily: "var(--font-inter)",
          fontSize: 18,
          lineHeight: 1.5,
          color: "rgba(0,0,0,0.55)",
          maxWidth: 560,
          marginTop: 20,
          marginBottom: 0,
        }}
      >
        Prompting is mostly revision. Paste what you have, score it against a rubric, refine it, and learn what makes a prompt actually work.
      </p>
    </section>
  );
}
