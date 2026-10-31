import type { Metadata, Viewport } from "next";
import Shell from "../_signature/Shell";
import Header from "../_signature/Header";
import Finale from "../_signature/Finale";
import Policy from "./Policy";
import shell from "../_signature/signature.module.css";
import styles from "../_signature/privacy.module.css";

export const metadata: Metadata = {
  title: "Privacy Policy · Neil McArdle",
  description: "How neilmcardle.com collects and handles personal data.",
};

export const viewport: Viewport = {
  themeColor: "#0d0d0c",
};

export default function PrivacyPage() {
  return (
    <Shell>
      <Header />
      <article className={`${shell.wrap} ${styles.policy}`}>
        <Policy />
      </article>
      <Finale />
    </Shell>
  );
}
