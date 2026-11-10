import type { Metadata } from "next";
import Link from "next/link";
import s from "../tessera.module.css";

export const metadata: Metadata = {
  title: "Tessera — Privacy",
  description:
    "Privacy policy for Tessera. The short version: nothing is collected.",
  alternates: { canonical: "https://neilmcardle.com/tessera/privacy" },
  robots: { index: true, follow: true },
};

export default function TesseraPrivacyLab() {
  return (
    <div className={s.root}>
      <div className={s.column}>
        <Link className={s.back} href="/tessera">
          Back to Tessera
        </Link>
        <article className={`${s.head} ${s.article}`}>
          <h1 className={s.title}>Privacy</h1>
          <p className={s.meta}>Last updated 10 November 2026</p>
          <p>
            <span className={s.subject}>
              Tessera does not collect, store or send any personal data.
            </span>
          </p>
          <p>
            The app keeps your win tally and player names on your device.
            Nothing leaves your phone. There is no analytics, no advertising, no
            tracking, no third-party code, no account and no sign-in.
          </p>
          <p>
            This policy covers the app. The web page you are reading counts
            anonymous page views, as described in the{" "}
            <Link className={s.link} href="/privacy">
              site privacy policy
            </Link>
            .
          </p>
          <p>
            If you delete the app, the win tally and player names go with it.
          </p>
          <h2>Contact</h2>
          <p>
            Questions about this policy go to{" "}
            <a className={s.link} href="mailto:neil@neilmcardle.com">
              neil@neilmcardle.com
            </a>
            .
          </p>
          <p className={s.meta}>
            I design and build Tessera on my own. It is a companion to
            DoodleWire on the App Store.
          </p>
        </article>
      </div>
    </div>
  );
}
