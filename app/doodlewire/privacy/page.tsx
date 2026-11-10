import type { Metadata } from "next";
import Link from "next/link";
import s from "../doodlewire.module.css";

export const metadata: Metadata = {
  title: "DoodleWire Privacy Policy",
  description:
    "DoodleWire collects no data. Everything you create stays on your device.",
};

export default function DoodleWirePrivacyLab() {
  return (
    <main id="main" className={s.page}>
      <div className={s.column}>
        <Link className={s.back} href="/doodlewire">
          Back to DoodleWire
        </Link>
        <article className={s.article}>
          <h1 className={s.title}>Privacy</h1>
          <p className={s.meta}>Last updated 10 November 2026</p>
          <p>
            <span className={s.subject}>
              DoodleWire does not collect, store or send any personal data.
            </span>
          </p>
          <p>
            Everything you make in DoodleWire, your drawings, wireframes and
            trained styles, is kept only on your device, in the app&apos;s local
            storage. It is never uploaded to a server. There is no account, no
            analytics and no tracking.
          </p>
          <p>DoodleWire asks for no device permissions.</p>
          <p>
            This policy covers the app. The web page you are reading counts
            anonymous page views, as described in the{" "}
            <Link className={s.link} href="/privacy">
              site privacy policy
            </Link>
            .
          </p>
          <p>
            Questions about this policy go to{" "}
            <a className={s.link} href="mailto:neil@neilmcardle.com">
              neil@neilmcardle.com
            </a>
            .
          </p>
        </article>
      </div>
    </main>
  );
}
