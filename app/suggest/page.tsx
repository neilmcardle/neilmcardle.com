import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import Shell from "@/app/_signature/Shell";
import Header from "@/app/_signature/Header";
import kit from "./kit.module.css";
import { share } from "@/app/shared-metadata";
import { db, suggestions } from "@/lib/db";
import SuggestForm from "./SuggestForm";
import styles from "./suggest.module.css";

export const dynamic = "force-dynamic";

const TITLE = "Suggest a change · Neil McArdle";
const DESCRIPTION =
  "Tell me what this site should do differently. If I like it, an AI agent builds it, I check it and it goes live.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  ...share({ title: TITLE, description: DESCRIPTION, path: "/suggest" }),
};

export const viewport: Viewport = {
  themeColor: "#0d0d0c",
};

const date = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

async function builtSuggestions() {
  try {
    return await db
      .select({
        id: suggestions.id,
        request: suggestions.request,
        prUrl: suggestions.prUrl,
        liveAt: suggestions.liveAt,
      })
      .from(suggestions)
      .where(eq(suggestions.status, "live"))
      .orderBy(desc(suggestions.liveAt))
      .limit(50);
  } catch (err) {
    console.error("[suggest] log read failed", err);
    return [];
  }
}

export default async function SuggestPage() {
  const built = await builtSuggestions();

  return (
    <Shell>
      <div className={kit.bar}>
        <Header contact="/#contact" />
      </div>
      <main id="main" lang="en-GB" className={`${kit.root} ${kit.scope}`}>
        <section className={`${kit.wrap} ${styles.hero}`}>
          <h1 className={kit.title}>Suggest a change.</h1>
          <p className={styles.lede}>
            <span className={styles.subject}>
              Tell me what this site should do differently.
            </span>{" "}
            If I like it, an AI agent builds it, I check it and it goes live.
          </p>
          <div className={styles.formWrap}>
            <SuggestForm />
          </div>
        </section>

        <section
          className={`${kit.wrap} ${styles.section}`}
          aria-labelledby="built"
        >
          <h2 id="built" className={styles.heading}>
            Built from suggestions
          </h2>
          {built.length ? (
            <ol className={styles.log}>
              {built.map((item) => (
                <li key={item.id}>
                  <p className={styles.request}>{item.request}</p>
                  <p className={styles.when}>
                    {item.liveAt ? date.format(item.liveAt) : null}
                    {item.prUrl ? (
                      <>
                        {" · "}
                        <a className={kit.link} href={item.prUrl}>
                          See the change
                        </a>
                      </>
                    ) : null}
                  </p>
                </li>
              ))}
            </ol>
          ) : (
            <p className={styles.empty}>Nothing yet.</p>
          )}
        </section>
      </main>
      <footer className={`${kit.wrap} ${styles.footer}`}>
        <Link className={styles.more} href="/#contact">
          Tell me more.
        </Link>
        <Link className={kit.link} href="/">
          neilmcardle.com
        </Link>
      </footer>
    </Shell>
  );
}
