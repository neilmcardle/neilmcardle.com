import type React from "react";
import styles from "@/app/_signature/privacy.module.css";

type Part = { className?: string; style?: React.CSSProperties };
type Look = Record<
  | "h1"
  | "date"
  | "note"
  | "link"
  | "strong"
  | "list"
  | "h2"
  | "text"
  | "section",
  Part
>;

const SITE: Look = {
  h1: {
    className: "text-site-ink mb-6",
    style: {
      fontFamily: "var(--font-inter)",
      fontSize: "clamp(2rem, 5vw, 2.75rem)",
      fontWeight: 400,
      letterSpacing: "-0.02em",
      lineHeight: 1.1,
    },
  },
  date: {
    className: "text-site-muted mb-2",
    style: { fontFamily: "var(--font-inter)", fontSize: "0.875rem" },
  },
  note: {
    className: "text-site-ink/60 mb-12",
    style: {
      fontFamily: "var(--font-inter)",
      fontSize: "0.875rem",
      lineHeight: 1.6,
    },
  },
  link: {
    className:
      "text-site-accent hover:text-site-accent-strong transition-colors",
  },
  strong: { className: "text-site-ink/85" },
  list: { className: "list-disc pl-5 space-y-2 mt-1" },
  section: { className: "mb-9" },
  h2: {
    className: "text-site-ink mb-3",
    style: {
      fontFamily: "var(--font-inter)",
      fontSize: "1.125rem",
      fontWeight: 600,
      letterSpacing: "-0.01em",
    },
  },
  text: {
    className: "text-site-ink/70",
    style: {
      fontFamily: "var(--font-inter)",
      fontSize: "0.9375rem",
      lineHeight: 1.7,
    },
  },
};

const SIGNATURE: Look = {
  h1: { className: styles.title },
  date: { className: styles.date },
  note: { className: styles.note },
  link: { className: styles.link },
  strong: { className: styles.strong },
  list: { className: styles.list },
  section: { className: styles.section },
  h2: { className: styles.heading },
  text: { className: styles.text },
};

export default function Policy({ variant }: { variant?: "signature" }) {
  const look = variant === "signature" ? SIGNATURE : SITE;
  return (
    <>
      <h1 {...look.h1}>Privacy Policy</h1>

      <p {...look.date}>Last updated: 10 September 2026</p>
      <p {...look.note}>
        This policy covers neilmcardle.com. makeebook has its own{" "}
        <a href="https://makeebook.ink/privacy" {...look.link}>
          privacy policy
        </a>
        .
      </p>

      <Section look={look} title="1. Who is responsible for your data">
        The data controller for neilmcardle.com is Neil McArdle, a sole trader
        based in London, England, operating under UK GDPR. You can reach me at{" "}
        <a href="mailto:neil@neilmcardle.com" {...look.link}>
          neil@neilmcardle.com
        </a>
        .
      </Section>

      <Section look={look} title="2. What I collect">
        <ul {...look.list}>
          <li>
            <strong {...look.strong}>When you contact me:</strong> your email
            address and whatever you choose to put in your message.
          </li>
          <li>
            <strong {...look.strong}>If you join a waitlist:</strong> your email
            address, so I can tell you when the project launches. A confirmation
            email is sent when you sign up.
          </li>
          <li>
            <strong {...look.strong}>If you subscribe:</strong> billing details
            handled by Stripe. Stripe processes your payment and card data
            directly; I never see or store your full card number.
          </li>
          <li>
            <strong {...look.strong}>Automatically:</strong> aggregate,
            anonymous page-view statistics through Vercel Analytics, which is
            cookie-less and does not identify you or track you across sites.
          </li>
        </ul>
      </Section>

      <Section look={look} title="3. Legal bases">
        I process contact data to respond to you and to perform or enter into a
        contract (Article 6(1)(b) UK GDPR). I keep waitlist emails on the basis
        of your consent (Article 6(1)(a)), which you can withdraw at any time. I
        use aggregate analytics on the basis of legitimate interest in
        understanding and improving the site (Article 6(1)(f)). Any advertising
        or measurement cookies are used only with your consent (Article
        6(1)(a)).
      </Section>

      <Section look={look} title="4. Who I share it with">
        I do not sell or rent your data. I share it only with the providers that
        run the site and the business: Vercel (hosting and cookie-less
        analytics), Supabase (database), Resend (email delivery) and Stripe
        (payments). Where you have consented to advertising cookies, measurement
        data is shared with Google. I also disclose data where the law requires
        it.
      </Section>

      <Section look={look} title="5. Cookies">
        <ul {...look.list}>
          <li>
            <strong {...look.strong}>Necessary:</strong> a small cookie that
            remembers your cookie-consent choice so you are not asked
            repeatedly.
          </li>
          <li>
            <strong {...look.strong}>Analytics:</strong> Vercel Analytics is
            cookie-less, so it sets nothing on your device.
          </li>
          <li>
            <strong {...look.strong}>
              Advertising and measurement (consent only):
            </strong>{" "}
            set only if you accept through the cookie banner, and removed when
            you withdraw consent. Until you consent, no advertising cookies are
            set and no identifiers are sent to Google.
          </li>
        </ul>
      </Section>

      <Section look={look} title="6. Retention">
        I keep correspondence for as long as needed to handle your enquiry and
        any resulting work, plus a reasonable period for legal and accounting
        purposes. Billing records are kept for six years as UK tax law requires.
        You can ask me to delete your data at any time, subject to those
        obligations.
      </Section>

      <Section look={look} title="7. Your rights">
        Under UK GDPR you have the right to access, correct, delete, restrict,
        or object to the processing of your personal data, the right to data
        portability, and the right to withdraw consent at any time. To exercise
        any of these, email me and I will respond within one month.
      </Section>

      <Section look={look} title="8. International transfers">
        Some providers (Vercel, Supabase, Resend, Stripe, Google) may process
        data outside the UK. Where they do, transfers are protected by
        mechanisms such as the UK Addendum to the EU Standard Contractual
        Clauses or the UK Extension to the EU-US Data Privacy Framework.
      </Section>

      <Section look={look} title="9. Complaints">
        If you are unhappy with how I handle your data, please tell me first so
        I can put it right. You also have the right to complain to the
        Information Commissioner&rsquo;s Office at{" "}
        <a
          href="https://ico.org.uk"
          {...look.link}
          target="_blank"
          rel="noopener noreferrer"
        >
          ico.org.uk
        </a>
        .
      </Section>

      <Section look={look} title="10. Changes">
        I may update this policy from time to time. The date at the top shows
        when it was last changed.
      </Section>

      <Section look={look} title="11. Contact">
        For anything about this policy or your data, email{" "}
        <a href="mailto:neil@neilmcardle.com" {...look.link}>
          neil@neilmcardle.com
        </a>
        .
      </Section>
    </>
  );
}

function Section({
  look,
  title,
  children,
}: {
  look: Look;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section {...look.section}>
      <h2 {...look.h2}>{title}</h2>
      <div {...look.text}>{children}</div>
    </section>
  );
}
