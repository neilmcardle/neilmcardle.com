import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DoodleWire Privacy Policy",
  description:
    "DoodleWire collects no data. Everything you create stays on your device.",
};

export default function DoodleWirePrivacyPage() {
  return (
    <main className="min-h-screen bg-[#faf9f5] px-6 py-16 text-[#0a0a0a]">
      <article className="mx-auto max-w-[640px]">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-black/40">
          DoodleWire
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-black/45">Last updated: 20 May 2026</p>

        <div className="mt-8 space-y-5 text-[15px] leading-relaxed text-black/75">
          <p>
            DoodleWire does not collect, store, or transmit any personal data.
          </p>
          <p>
            Everything you create in DoodleWire (your drawings, wireframes, and
            trained styles) is stored only on your device, in the app&apos;s
            local storage. It is never uploaded to any server. DoodleWire has
            no account system, no analytics, and no tracking.
          </p>
          <p>
            The only network feature is an optional &ldquo;Support
            development&rdquo; link, which opens an external Buy Me a Coffee
            page in your browser. Any payment made there is handled entirely by
            Buy Me a Coffee under their own privacy policy.
          </p>
          <p>DoodleWire requests no device permissions.</p>
          <p>
            If you have any questions about this policy, contact{" "}
            <a
              href="mailto:neil@neilmcardle.com"
              className="font-medium text-black underline underline-offset-4"
            >
              neil@neilmcardle.com
            </a>
            .
          </p>
        </div>

        <a
          href="/doodlewire"
          className="mt-10 inline-block text-sm font-medium text-black/55 underline underline-offset-4"
        >
          Back to DoodleWire
        </a>
      </article>
    </main>
  );
}
