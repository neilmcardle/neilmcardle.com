import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Tessera — Support",
  description: "Support and contact for Tessera.",
  alternates: { canonical: "https://neilmcardle.com/tessera/support" },
  robots: { index: true, follow: true },
};

export default function TesseraSupport() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f7f1e3",
        color: "#2b2622",
        fontFamily: "ui-sans-serif, system-ui, sans-serif",
        display: "flex",
        justifyContent: "center",
        padding: "64px 24px",
      }}
    >
      <article
        style={{
          maxWidth: 640,
          width: "100%",
          fontSize: 16,
          lineHeight: 1.65,
        }}
      >
        <Link
          href="/tessera"
          style={{
            display: "inline-block",
            fontSize: 12,
            letterSpacing: "0.13em",
            textTransform: "uppercase",
            color: "#2b2622",
            textDecoration: "none",
            opacity: 0.65,
            marginBottom: 32,
          }}
        >
          ← Back to Tessera
        </Link>

        <h1 style={{ fontSize: 36, fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 16px" }}>
          Support
        </h1>

        <p>
          Tessera is a solo project. Bug reports, questions, feature ideas,
          or anything else: drop me an email.
        </p>

        <p style={{ marginTop: 24 }}>
          <a
            href="mailto:neil@neilmcardle.com?subject=Tessera"
            style={{
              display: "inline-block",
              padding: "12px 18px",
              borderRadius: 14,
              border: "2px solid #2b2622",
              color: "#2b2622",
              textDecoration: "none",
              fontWeight: 700,
              fontSize: 15,
            }}
          >
            neil@neilmcardle.com
          </a>
        </p>

        <p style={{ marginTop: 48, fontSize: 14, opacity: 0.75 }}>
          I try to reply within a day or two. The game is free and there
          are no ads — if Tessera made your evening, the tip jar in
          Settings is the nicest way to say thanks.
        </p>

        <p style={{ marginTop: 48, fontSize: 12, opacity: 0.5 }}>
          Tessera is designed and built by Neil McArdle. Companion to
          DoodleWire on the App Store.
        </p>
      </article>
    </main>
  );
}
