import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — Neil McArdle",
  description: "How neilmcardle.com collects and handles personal data.",
};

export default function PrivacyPage() {
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
          Privacy Policy
        </h1>

        <p className="text-tan mb-2" style={{ fontFamily: "var(--font-inter)", fontSize: "0.875rem" }}>
          Last updated: {new Date().toLocaleDateString("en-GB")}
        </p>
        <p className="text-cream/60 mb-12" style={{ fontFamily: "var(--font-inter)", fontSize: "0.875rem", lineHeight: 1.6 }}>
          This policy covers neilmcardle.com. makeEbook has its own{" "}
          <a href="https://makeebook.ink/privacy" className="text-gold hover:text-gold-bright transition-colors">privacy policy</a>.
        </p>

        <Section title="1. Who is responsible for your data">
          The data controller for neilmcardle.com is Neil McArdle, a sole trader based in London, England, operating under UK
          GDPR. You can reach me at{" "}
          <a href="mailto:neil@neilmcardle.com" className="text-gold hover:text-gold-bright transition-colors">neil@neilmcardle.com</a>.
        </Section>

        <Section title="2. What I collect">
          <ul className="list-disc pl-5 space-y-2 mt-1">
            <li><strong className="text-cream/85">When you contact me:</strong> your email address and whatever you choose to put in your message.</li>
            <li><strong className="text-cream/85">If you subscribe:</strong> billing details handled by Stripe. Stripe processes your payment and card data directly; I never see or store your full card number.</li>
            <li><strong className="text-cream/85">Automatically:</strong> aggregate, anonymous page-view statistics through Vercel Analytics, which is cookie-less and does not identify you or track you across sites.</li>
          </ul>
        </Section>

        <Section title="3. Legal bases">
          I process contact data to respond to you and to perform or enter into a contract (Article 6(1)(b) UK GDPR). I use
          aggregate analytics on the basis of legitimate interest in understanding and improving the site (Article 6(1)(f)).
          Any advertising or measurement cookies are used only with your consent (Article 6(1)(a)).
        </Section>

        <Section title="4. Who I share it with">
          I do not sell or rent your data. I share it only with the providers that run the site and the business: Vercel
          (hosting and cookie-less analytics) and Stripe (payments). Where you have consented to advertising cookies, measurement
          data is shared with Google. I also disclose data where the law requires it.
        </Section>

        <Section title="5. Cookies">
          <ul className="list-disc pl-5 space-y-2 mt-1">
            <li><strong className="text-cream/85">Necessary:</strong> a small cookie that remembers your cookie-consent choice so you are not asked repeatedly.</li>
            <li><strong className="text-cream/85">Analytics:</strong> Vercel Analytics is cookie-less, so it sets nothing on your device.</li>
            <li><strong className="text-cream/85">Advertising and measurement (consent only):</strong> set only if you accept through the cookie banner, and removed when you withdraw consent. Until you consent, no advertising cookies are set and no identifiers are sent to Google.</li>
          </ul>
        </Section>

        <Section title="6. Retention">
          I keep correspondence for as long as needed to handle your enquiry and any resulting work, plus a reasonable period for
          legal and accounting purposes. Billing records are kept for six years as UK tax law requires. You can ask me to delete
          your data at any time, subject to those obligations.
        </Section>

        <Section title="7. Your rights">
          Under UK GDPR you have the right to access, correct, delete, restrict, or object to the processing of your personal
          data, the right to data portability, and the right to withdraw consent at any time. To exercise any of these, email me
          and I will respond within one month.
        </Section>

        <Section title="8. International transfers">
          Some providers (Vercel, Stripe, Google) may process data outside the UK. Where they do, transfers are protected by
          mechanisms such as the UK Addendum to the EU Standard Contractual Clauses or the UK Extension to the EU-US Data Privacy
          Framework.
        </Section>

        <Section title="9. Complaints">
          If you are unhappy with how I handle your data, please tell me first so I can put it right. You also have the right to
          complain to the Information Commissioner&rsquo;s Office at{" "}
          <a href="https://ico.org.uk" className="text-gold hover:text-gold-bright transition-colors" target="_blank" rel="noopener noreferrer">ico.org.uk</a>.
        </Section>

        <Section title="10. Changes">
          I may update this policy from time to time. The date at the top shows when it was last changed.
        </Section>

        <Section title="11. Contact">
          For anything about this policy or your data, email{" "}
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
      <div className="text-cream/70" style={{ fontFamily: "var(--font-inter)", fontSize: "0.9375rem", lineHeight: 1.7 }}>
        {children}
      </div>
    </section>
  );
}
