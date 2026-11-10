import type React from "react";
import kit from "./kit.module.css";
import styles from "./privacy.module.css";

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

const LOOK: Look = {
  h1: { className: kit.title },
  date: { className: styles.date },
  note: { className: styles.note },
  link: { className: kit.link },
  strong: { className: styles.strong },
  list: { className: styles.list },
  section: { className: styles.section },
  h2: { className: styles.heading },
  text: { className: styles.text },
};

export default function Policy() {
  const look = LOOK;
  return (
    <>
      <h1 {...look.h1}>Privacy policy</h1>

      <p {...look.date}>Last updated 10 November 2026</p>
      <p {...look.note}>
        This policy covers neilmcardle.com. makeEbook has its own{" "}
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
            <strong {...look.strong}>
              If you order a Vector Paint canvas:
            </strong>{" "}
            your drawing, the print file made from it and your email address.
            Your delivery address is handled by Stripe and the printer, Gelato.
          </li>
          <li>
            <strong {...look.strong}>If you send a suggestion:</strong> the text
            you write, stored in the site&rsquo;s database. If I choose to build
            it, the text is sent to GitHub and to Anthropic&rsquo;s Claude to
            make the change. Please leave out personal details.
          </li>
          <li>
            <strong {...look.strong}>If you use Promptr:</strong> the prompt you
            paste is sent to Anthropic&rsquo;s Claude to score it. It is not
            stored.
          </li>
          <li>
            <strong {...look.strong}>If you use Book Mind in makeEbook:</strong>{" "}
            the parts of your book it needs to answer you are sent to
            Anthropic&rsquo;s Claude.
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
        analytics), Supabase (database), Resend (email delivery), Stripe
        (payments), Gelato (printing Vector Paint canvases), Anthropic (the AI
        model behind Book Mind, Promptr and suggestions) and GitHub (where
        suggested changes are built). Where you have consented to advertising
        cookies, measurement data is shared with Google. I also disclose data
        where the law requires it.
      </Section>

      <Section look={look} title="5. Cookies">
        <ul {...look.list}>
          <li>
            <strong {...look.strong}>Necessary:</strong> a small entry in your
            browser&rsquo;s local storage that remembers your consent choice, so
            you are not asked again.
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
        Vector Paint drawings, print files and email addresses are deleted 30
        days after an unpaid order, and one year after a paid one. You can ask
        me to delete your data at any time, subject to those obligations.
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
