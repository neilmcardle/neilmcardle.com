import type { Metadata, Viewport } from "next";
import Shell from "../../_signature/Shell";
import Header from "../../_signature/Header";
import Finale from "../../_signature/Finale";
import Policy from "../../privacy/Policy";
import shell from "../../_signature/signature.module.css";
import styles from "../../_signature/privacy.module.css";

export const metadata: Metadata = {
  title: "Privacy Policy · Neil McArdle",
  description: "How neilmcardle.com collects and handles personal data.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#0d0d0c",
};

export default function NextPrivacy() {
  return (
    <Shell>
      <Header home="/next" />
      <article className={`${shell.wrap} ${styles.policy}`}>
        <Policy variant="signature" />
      </article>
      <Finale />
    </Shell>
  );
}
