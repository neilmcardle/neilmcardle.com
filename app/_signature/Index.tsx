import type React from "react";
import Image from "next/image";
import Link from "next/link";
import { COVERS } from "@/app/_home/covers";
import {
  GROUP_LABEL,
  WORKS,
  slug,
  type GroupKey,
  type Work,
} from "@/app/_home/data";
import { PAINTINGS, SAATCHI_URL } from "@/app/_home/paintings";
import { SHOWCASE } from "@/app/_home/showcase";
import shell from "./signature.module.css";
import styles from "./index.module.css";

const LISTS: GroupKey[] = ["explorations", "tools", "kids", "books"];

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
          <div className={styles.rows}>
            {WORKS.filter((work) => work.group === key).map((work) => (
              <Row key={work.title} work={work} />
            ))}
          </div>
        </Group>
      ))}
      <Group id="covers" title={GROUP_LABEL.covers}>
        <div className={styles.shelf}>
          {COVERS.map((cover) => (
            <figure key={cover.title} className={styles.plate}>
              <Image
                className={styles.cover}
                src={cover.image}
                alt={`${cover.title} by ${cover.author}`}
                width={cover.width}
                height={cover.height}
                sizes="(max-width: 720px) 50vw, 300px"
              />
              <figcaption>
                <span className={styles.name}>{cover.title}</span>
                <span className={styles.line}>
                  {cover.author}, {cover.year}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </Group>
      <Group id="paintings" title={GROUP_LABEL.paintings}>
        <div className={styles.shelf}>
          {PAINTINGS.map((painting) => (
            <figure
              key={painting.slug}
              className={styles.plate}
              id={slug(painting.title)}
            >
              <span
                className={styles.canvas}
                style={{ aspectRatio: painting.aspect ?? "4/5" }}
              >
                <Image
                  src={painting.image}
                  alt={`${painting.title}, ${painting.medium.toLowerCase()}`}
                  fill
                  sizes="(max-width: 720px) 50vw, 300px"
                />
              </span>
              <figcaption>
                <span className={styles.name}>{painting.title}</span>
                <span className={styles.line}>
                  {painting.medium}, {painting.year}.{" "}
                  {painting.status === "sold" ? "Sold" : "Available"}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
        <a className={styles.more} href={SAATCHI_URL} rel="noopener">
          More on Saatchi Art
        </a>
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
