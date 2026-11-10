import type { Metadata, Viewport } from "next";
import Shell from "@/app/_signature/Shell";
import Header from "@/app/_signature/Header";
import Finale from "@/app/_signature/Finale";
import Policy from "./Policy";
import kit from "./kit.module.css";
import styles from "./privacy.module.css";

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
      <div className={kit.bar}>
        <Header />
      </div>
      <main id="main" className={`${kit.root} ${kit.scope}`}>
        <article className={`${kit.wrap} ${styles.policy}`}>
          <Policy />
        </article>
      </main>
      <Finale />
    </Shell>
  );
}
