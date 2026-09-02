"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "./home.module.css";
import IdentityCard, { type Lean } from "./IdentityCard";
import DotField from "./DotField";
import LiveSentence from "./LiveSentence";
import DailyDrawing from "./DailyDrawing";
import SelectedWork from "./SelectedWork";
import SiteMenu from "./SiteMenu";

export default function HomeShell() {
  const [lean, setLean] = useState<Lean>("none");

  return (
    <div className={styles.page}>
      <SiteMenu />

      <div className={styles.shell}>
        <header className={styles.masthead}>
          <DotField className={styles.heroDots} fps={2.5} />
          <IdentityCard lean={lean} />
          <div>
            <LiveSentence onLean={setLean} />

            <p className={styles.credentialsEyebrow}>Trusted by</p>

            <div className={styles.credentials}>
              <Credential
                src="/logos/avis-budget-group.svg"
                alt="Avis Budget Group"
                height={15}
                tip="In-house"
              />
              <Credential
                src="/logos/mobbin.svg"
                alt="Mobbin"
                height={15}
                tip="Contractor"
              />
              <Credential
                src="/logos/banner-of-truth.svg"
                alt="The Banner of Truth"
                height={30}
                tip="Previously"
              />
            </div>
          </div>
        </header>

        <section id="work" className={styles.work}>
          <div className={styles.sectionHead}>
            <span className={styles.sectionNum} aria-hidden="true">
              01
            </span>
            <span className={styles.sectionLabel}>
              A few things I&rsquo;m building
            </span>
            <span className={styles.rule} />
          </div>

          <SelectedWork />
        </section>

        <DailyDrawing index="02" />

        <section className={styles.tellMore}>
          <DotField className={styles.tellMoreDots} seedOffset={7} />

          <div className={styles.sectionHead}>
            <span className={styles.sectionNum} aria-hidden="true">
              03
            </span>
            <span className={styles.sectionLabel}>
              Contact me, I promise I&rsquo;ll read it
            </span>
            <span className={styles.rule} />
          </div>

          <div className={styles.tellMoreBody}>
            <h2 className={styles.tellMoreTitle}>Tell me more.</h2>
            <CopyEmail />
          </div>
        </section>

        <footer className={styles.foot}>
          <span>&copy; 2026 Neil McArdle</span>
          <div className={styles.footLinks}>
            <Link className={styles.footLink} href="/privacy">
              Privacy
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}

function Credential({
  src,
  alt,
  height,
  tip,
}: {
  src: string;
  alt: string;
  height: number;
  tip: string;
}) {
  return (
    <span className={styles.credentialItem}>
      <img
        className={styles.credentialLogo}
        src={src}
        alt={alt}
        style={{ height }}
      />
      <span className={styles.credentialTip} role="tooltip">
        {tip}
      </span>
    </span>
  );
}

const EMAIL = "neil@neilmcardle.com";

function CopyEmail() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
    } catch {
      const field = document.createElement("textarea");
      field.value = EMAIL;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.opacity = "0";
      document.body.appendChild(field);
      field.select();
      document.execCommand("copy");
      field.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <button type="button" className={styles.tellMoreCopy} onClick={copy}>
      <span>{EMAIL}</span>
      {copied ? (
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      ) : (
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.7}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="9" y="9" width="11" height="11" rx="2" />
          <path d="M5 15V5a2 2 0 0 1 2-2h10" />
        </svg>
      )}
      <span className={styles.srOnly} aria-live="polite">
        {copied ? "Email address copied" : ""}
      </span>
    </button>
  );
}
