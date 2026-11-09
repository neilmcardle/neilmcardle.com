import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { ReactNode } from "react";
import Link from "next/link";
import Shell from "@/app/_signature/Shell";
import Header from "@/app/_signature/Header";
import Finale from "@/app/_signature/Finale";
import bar from "@/app/_signature/case.module.css";
import { Markdown, slug, type Sizes } from "./markdown";
import Contents from "./Contents";
import { WRITING_PUBLIC } from "@/app/_home/data";
import styles from "./article.module.css";

export const UNLISTED = {
  index: false,
  follow: false,
  googleBot: { index: false, follow: false },
};

export function readArticle(path: string) {
  const raw = readFileSync(join(process.cwd(), path), "utf8");
  const lines = raw.split("\n");
  const title = (lines.find((l) => l.startsWith("# ")) ?? "").slice(2).trim();
  const rest = lines.slice(lines.findIndex((l) => l.startsWith("# ")) + 1);
  const bylineAt = rest.findIndex((l) => l.trim() !== "");
  const byline = /·/.test(rest[bylineAt] ?? "") ? rest[bylineAt].trim() : "";
  const body = byline ? rest.slice(bylineAt + 1).join("\n") : rest.join("\n");
  return { title, byline, body };
}

export default function Article({
  path,
  sizes,
  back = WRITING_PUBLIC ? "/#writing" : "/",
  backLabel = WRITING_PUBLIC ? "Writing" : "Home",
  after,
  wide = false,
  endLabel = WRITING_PUBLIC ? "More writing" : "Home",
}: {
  path: string;
  sizes?: Sizes;
  back?: string;
  backLabel?: string;
  after?: ReactNode;
  wide?: boolean;
  endLabel?: string;
}) {
  const { title, byline, body } = readArticle(path);
  const sections = body
    .split("\n")
    .filter((line) => /^##\s/.test(line))
    .map((line) => {
      const text = line.replace(/^##\s+/, "").trim();
      const plain = text
        .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
        .replace(/\*\*|\*|_/g, "");
      const era = plain.match(/^(\d{4}–\d{4}):/);
      return { id: slug(text), label: era ? era[1] : plain };
    });
  return (
    <Shell>
      <div className={bar.bar}>
        <Header back={back} backLabel={backLabel} />
      </div>
      <Contents sections={sections} />
      <main id="main" className={styles.main}>
        <article className={`${styles.article} ${wide ? styles.wide : ""}`}>
          <header className={styles.head}>
            <h1 className={styles.title}>{title}</h1>
            {byline ? <p className={styles.byline}>{byline}</p> : null}
          </header>
          <Markdown source={body} sizes={sizes} />
          {after}
          <p className={styles.ending}>
            <Link className={styles.back} href={back}>
              {endLabel}
            </Link>
          </p>
        </article>
      </main>
      <Finale signOff />
    </Shell>
  );
}
