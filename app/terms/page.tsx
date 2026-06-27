import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service — Neil McArdle",
  description: "Terms for the neilmcardle.com design and build subscription service.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black">
      <main className="home-prose max-w-3xl mx-auto px-6 lg:px-10 pt-16 pb-24">
        <Link
          href="/"
          className="inline-block mb-12 text-tan hover:text-cream transition-colors"
          style={{ fontFamily: "var(--font-inter)", fontSize: "0.75rem", letterSpacing: "0.13em", textTransform: "uppercase" }}
        >
          ← Back
        </Link>

        <h1
          className="text-cream mb-6"
          style={{ fontFamily: "var(--font-inter)", fontSize: "clamp(2rem, 5vw, 2.75rem)", fontWeight: 400, letterSpacing: "-0.02em", lineHeight: 1.1 }}
        >
          Terms of Service
        </h1>

        <p className="text-tan mb-2" style={{ fontFamily: "var(--font-inter)", fontSize: "0.875rem" }}>
          Last updated: {new Date().toLocaleDateString("en-GB")}
        </p>
        <p className="text-cream/60 mb-12" style={{ fontFamily: "var(--font-inter)", fontSize: "0.875rem", lineHeight: 1.6 }}>
          These terms cover the design and build service offered at neilmcardle.com by Neil McArdle, a sole trader based in
          London, England. They do not cover makeEbook, which has its own{" "}
          <a href="https://makeebook.ink/terms" className="text-gold hover:text-gold-bright transition-colors">terms</a>.
        </p>

        <Section title="1. The service">
          neilmcardle.com offers a monthly design and build subscription. You send requests, I design and build them, and ship
          the result to your domain. I take one client at a time. Work is handled asynchronously; there are no scheduled calls
          or meetings unless we agree otherwise.
        </Section>

        <Section title="2. Requests and scope">
          You may keep as many requests as you like in your queue, but one is actively worked at a time, in the priority order
          you set. Larger pieces of work are broken into a sequence and shipped in order. I will tell you honestly and promptly
          if a request is out of scope or unrealistic for the subscription.
        </Section>

        <Section title="3. Billing and payment">
          The subscription is billed monthly in advance through Stripe at the price shown on the site, plus VAT where
          applicable. Payment card details are handled entirely by Stripe; I never see or store your full card number. The
          subscription renews automatically each month until paused or cancelled.
        </Section>

        <Section title="4. Pause and cancellation">
          You can pause or cancel at any time. When you pause, billing freezes and resumes where it left off when you return.
          When you cancel, you keep access until the end of the current paid month. Because work begins immediately and capacity
          is reserved for one client, paid months are non-refundable once started.
        </Section>

        <Section title="5. Your responsibilities">
          To do good work I need timely input from you: clear briefs, the assets and access a request needs, and feedback when I
          ask for it. Delays in providing these will delay delivery. You confirm that any material you give me is yours to use
          and does not infringe anyone else&rsquo;s rights.
        </Section>

        <Section title="6. Intellectual property">
          Once a month is paid in full, you own the final deliverables produced for you in that period. I retain ownership of any
          pre-existing tools, libraries, and general know-how I bring to the work, and the right to display the finished work in
          my portfolio and case studies unless we agree in writing to keep a project private.
        </Section>

        <Section title="7. Confidentiality">
          I treat anything you share that is not already public as confidential and will not disclose it beyond what is needed to
          do the work. If you need a separate non-disclosure agreement, I am happy to sign a reasonable one.
        </Section>

        <Section title="8. Warranties and liability">
          I provide the service with reasonable skill and care. Beyond that, the service is provided without further warranties to
          the fullest extent the law allows. Nothing in these terms limits liability for death or personal injury caused by
          negligence, fraud, or anything that cannot be limited by law. Subject to that, my total liability arising from the
          service is limited to the fees you paid in the month in which the claim arose.
        </Section>

        <Section title="9. Privacy">
          How I handle your personal data is set out in the{" "}
          <Link href="/privacy" className="text-gold hover:text-gold-bright transition-colors">Privacy Policy</Link>, which forms
          part of these terms.
        </Section>

        <Section title="10. Changes to these terms">
          I may update these terms from time to time. Material changes will be communicated to active clients by email. Continuing
          to use the service after a change means you accept the updated terms.
        </Section>

        <Section title="11. Governing law">
          These terms are governed by the laws of England and Wales, and the courts of England and Wales have exclusive
          jurisdiction over any dispute arising from them.
        </Section>

        <Section title="12. Contact">
          Questions about these terms? Email{" "}
          <a href="mailto:neil@neilmcardle.com" className="text-gold hover:text-gold-bright transition-colors">neil@neilmcardle.com</a>.
        </Section>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-9">
      <h2
        className="text-cream mb-3"
        style={{ fontFamily: "var(--font-inter)", fontSize: "1.125rem", fontWeight: 600, letterSpacing: "-0.01em" }}
      >
        {title}
      </h2>
      <p className="text-cream/70" style={{ fontFamily: "var(--font-inter)", fontSize: "0.9375rem", lineHeight: 1.7 }}>
        {children}
      </p>
    </section>
  );
}
