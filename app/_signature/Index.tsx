import type React from "react";
import Link from "next/link";
import { COVERS } from "./data/covers";
import { GROUP_LABEL, WORKS, type GroupKey, type Work } from "./data/data";
import { SHOWCASE } from "./data/showcase";
import HoverRows from "./HoverRows";
import shell from "./signature.module.css";
import styles from "./index.module.css";

const LISTS: GroupKey[] = ["explorations", "tools", "kids"];

const PAGES: Record<string, string> = { Podium: "/work/podium" };

const BUILDING = WORKS.filter(
  (work) => work.group === "products" && work.sub !== "Shipped",
);

function Row({ work, line }: { work: Work; line?: string }) {
  const body = (
    <>
      <span className={styles.name}>{work.title}</span>
      <span className={styles.line}>{line ?? work.pills.join(", ")}</span>
    </>
  );
  if (!work.href) return <div className={styles.row}>{body}</div>;
  if (work.href.startsWith("http"))
    return (
      <a className={styles.row} href={work.href} rel="noopener">
        {body}
      </a>
    );
  return (
    <Link className={styles.row} href={work.href}>
      {body}
    </Link>
  );
}

function Group({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className={styles.group} aria-labelledby={`all-${id}`} id={id}>
      <h3 className={styles.groupTitle} id={`all-${id}`}>
        {title}
      </h3>
      {children}
    </section>
  );
}

export default function Index({
  base = "",
  rest = false,
}: {
  base?: string;
  rest?: boolean;
}) {
  const others = (
    <>
      {LISTS.map((key) => (
        <Group key={key} id={key} title={GROUP_LABEL[key]}>
          {key === "explorations" ? (
            <HoverRows works={WORKS.filter((work) => work.group === key)} />
          ) : (
            <div className={styles.rows}>
              {WORKS.filter((work) => work.group === key).map((work) => (
                <Row key={work.title} work={work} />
              ))}
            </div>
          )}
        </Group>
      ))}
      <Group id="covers" title={GROUP_LABEL.covers}>
        <HoverRows
          portrait
          works={COVERS.map((cover) => ({
            title: cover.title,
            group: "covers",
            sub: "The Banner of Truth",
            href: "",
            preview: cover.image.replace("/home/covers/", "/home/peek/covers/"),
            pills: [cover.author, String(cover.year)],
          }))}
        />
      </Group>
    </>
  );
  if (rest) return <div className={styles.others}>{others}</div>;
  return (
    <section className={`${shell.wrap} ${styles.index}`}>
      <h2 className={shell.label} id="play">
        Playground
      </h2>
      <Group id="in-progress" title="In progress">
        <div className={styles.rows}>
          {BUILDING.map((work) => (
            <Row
              key={work.title}
              work={
                PAGES[work.title]
                  ? { ...work, href: `${base}${PAGES[work.title]}` }
                  : work
              }
              line={SHOWCASE[work.title]?.what}
            />
          ))}
        </div>
      </Group>
      {others}
    </section>
  );
}
