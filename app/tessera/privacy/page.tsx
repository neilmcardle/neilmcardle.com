import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Tessera — Privacy",
  description: "Privacy policy for Tessera. The short version: nothing is collected.",
  alternates: { canonical: "https://neilmcardle.com/tessera/privacy" },
  robots: { index: true, follow: true },
};

export default function TesseraPrivacy() {
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

        <h1 style={{ fontSize: 36, fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 8px" }}>
          Privacy
        </h1>
        <p style={{ fontSize: 13, opacity: 0.55, margin: "0 0 32px", letterSpacing: "0.05em" }}>
          Last updated 30 May 2026
        </p>

        <p>
          Tessera does not collect, store, or transmit any personal data.
        </p>

        <p>
          The app keeps your win-tally count and player names on your device.
          Nothing leaves your phone. There is no analytics, no advertising,
          no tracking, no third-party SDKs, no account, and no sign-in.
        </p>

        <p>
          If you delete the app, the win tally and player names are deleted
          with it.
        </p>

        <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 40, marginBottom: 8 }}>
          The optional tip jar
        </h2>
        <p>
          Tessera includes a &ldquo;Buy me a coffee&rdquo; link in Settings.
          Tapping it opens an external page on{" "}
          <a
            href="https://buymeacoffee.com/neilmcardle"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#2b2622", textDecoration: "underline" }}
          >
            buymeacoffee.com
          </a>
          . Any payment is handled entirely by Buy Me a Coffee under their
          own privacy policy. Tessera itself receives no information about
          who tipped, how much, or whether anything was sent at all.
        </p>

        <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 40, marginBottom: 8 }}>
          Contact
        </h2>
        <p>
          Questions about this policy:{" "}
          <a href="mailto:neil@neilmcardle.com" style={{ color: "#2b2622", textDecoration: "underline" }}>
            neil@neilmcardle.com
          </a>
          .
        </p>

        <p style={{ marginTop: 48, fontSize: 12, opacity: 0.5 }}>
          Tessera is designed and built by Neil McArdle. Companion to
          DoodleWire on the App Store.
        </p>
      </article>
    </main>
  );
}
