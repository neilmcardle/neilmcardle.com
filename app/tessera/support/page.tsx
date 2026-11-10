import type { Metadata } from "next";
import Link from "next/link";
import s from "../tessera.module.css";

export const metadata: Metadata = {
  title: "Tessera — Support",
  description: "Support and contact for Tessera.",
  alternates: { canonical: "https://neilmcardle.com/tessera/support" },
  robots: { index: true, follow: true },
};

export default function TesseraSupportLab() {
  return (
    <div className={s.root}>
      <div className={s.column}>
        <Link className={s.back} href="/tessera">
          Back to Tessera
        </Link>
        <article className={`${s.head} ${s.article}`}>
          <h1 className={s.title}>Support</h1>
          <p>
            <span className={s.subject}>Tessera is a solo project.</span> Bug
            reports, questions, ideas or anything else, send me an email.
          </p>
          <p className={s.mail}>
            <a
              className={s.btn}
              href="mailto:neil@neilmcardle.com?subject=Tessera"
            >
              Email neil@neilmcardle.com
            </a>
          </p>
          <p>
            I try to reply within a day or two. The game is free and there are
            no ads.
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
