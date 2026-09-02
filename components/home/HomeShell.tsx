"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "./home.module.css";
import IdentityCard, { type Lean } from "./IdentityCard";
import LiveSentence from "./LiveSentence";
import DailyDrawing from "./DailyDrawing";
import SelectedWork from "./SelectedWork";
import AlsoBuilt from "./AlsoBuilt";
import SiteMenu from "./SiteMenu";

export default function HomeShell() {
  const [lean, setLean] = useState<Lean>("none");

  return (
    <div className={styles.page}>
      <SiteMenu />

      <div className={styles.shell}>
        <header className={styles.masthead}>
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

        <section className={styles.workMinor}>
          <div className={styles.sectionHead}>
            <span className={styles.sectionNum} aria-hidden="true">
              02
            </span>
            <span className={styles.sectionLabel}>
              A few tools I forgot I made
            </span>
            <span className={styles.rule} />
          </div>

          <AlsoBuilt />
        </section>

        <DailyDrawing index="03" />

        <section className={styles.tellMore}>
          <div className={styles.sectionHead}>
            <span className={styles.sectionNum} aria-hidden="true">
              04
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
          <div className={styles.social}>
            <a
              href="https://www.linkedin.com/in/neilmcardle/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className={styles.socialLink}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z" />
              </svg>
            </a>
            <a
              href="https://github.com/neilmcardle"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className={styles.socialLink}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </a>
            <a
              href="https://x.com/BetterNeil"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X"
              className={styles.socialLink}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
          </div>
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
