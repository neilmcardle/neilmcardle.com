import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./article.module.css";

export type Sizes = Record<string, { width: number; height: number }>;

export function slug(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const INLINE =
  /\*\*([^*]+)\*\*|\*([^*]+)\*|\[([^\]]+)\]\(<([^>]+)>\)|\[([^\]]+)\]\(([^)\s]+)\)|(?<![\w/])_([^_\n]+?)_(?!\w)/g;

function A({ href, children }: { href: string; children: ReactNode }) {
  if (href.startsWith("/"))
    return (
      <Link className={styles.link} href={href}>
        {children}
      </Link>
    );
  return (
    <a className={styles.link} href={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  );
}

export function inline(text: string, key = "i"): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let n = 0;
  for (const m of text.matchAll(INLINE)) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const k = `${key}-${n++}`;
    if (m[1] !== undefined)
      out.push(<strong key={k}>{inline(m[1], k)}</strong>);
    else if (m[2] !== undefined) out.push(<em key={k}>{inline(m[2], k)}</em>);
    else if (m[7] !== undefined) out.push(<em key={k}>{inline(m[7], k)}</em>);
    else if (m[3] !== undefined)
      out.push(
        <A key={k} href={m[4]}>
          {inline(m[3], k)}
        </A>,
      );
    else
      out.push(
        <A key={k} href={m[6]}>
          {inline(m[5], k)}
        </A>,
      );
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function cells(row: string) {
  return row
    .trim()
    .replace(/^\||\|$/g, "")
    .split("|")
    .map((c) => c.trim());
}

function Picture({
  src,
  alt,
  caption,
  sizes,
}: {
  src: string;
  alt: string;
  caption?: string;
  sizes: Sizes;
}) {
  const size = sizes[src];
  return (
    <figure className={styles.figure}>
      <div className={styles.shot}>
        {src.endsWith(".svg") || !size ? (
          <img
            src={src}
            alt={alt}
            width={size?.width}
            height={size?.height}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <Image
            src={src}
            alt={alt}
            width={size.width}
            height={size.height}
            sizes={`(max-width: 720px) 100vw, ${Math.min(size.width, 680)}px`}
            style={{ maxWidth: Math.min(size.width, 680) }}
          />
        )}
      </div>
      {caption ? (
        <figcaption className={styles.caption}>{inline(caption)}</figcaption>
      ) : null}
    </figure>
  );
}

export function Markdown({
  source,
  sizes = {},
}: {
  source: string;
  sizes?: Sizes;
}) {
  const lines = source.replace(/\r/g, "").split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;
  const key = () => `b${blocks.length}`;
  const isBlank = (l?: string) => l === undefined || l.trim() === "";

  while (i < lines.length) {
    const line = lines[i];
    if (isBlank(line)) {
      i++;
      continue;
    }
    const heading = line.match(/^(#{2,3})\s+(.*)$/);
    if (heading) {
      const text = heading[2];
      const Tag = heading[1].length === 2 ? "h2" : "h3";
      blocks.push(
        <Tag
          key={key()}
          id={slug(text)}
          className={Tag === "h2" ? styles.h2 : styles.h3}
        >
          {inline(text)}
        </Tag>,
      );
      i++;
      continue;
    }
    const image = line.match(/^!\[([^\]]*)\]\(([^)]+)\)\s*$/);
    if (image) {
      let j = i + 1;
      while (isBlank(lines[j]) && j < lines.length) j++;
      const next = lines[j] ?? "";
      const caption = /^([*_])[^*_].*\1$/.test(next.trim())
        ? next.trim().slice(1, -1)
        : undefined;
      blocks.push(
        <Picture
          key={key()}
          src={image[2]}
          alt={image[1]}
          caption={caption}
          sizes={sizes}
        />,
      );
      i = caption ? j + 1 : i + 1;
      continue;
    }
    if (line.startsWith(">")) {
      const quote: string[] = [];
      while (i < lines.length && lines[i].startsWith(">")) {
        quote.push(lines[i].replace(/^>\s?/, ""));
        i++;
      }
      blocks.push(
        <aside key={key()} className={styles.aside}>
          <p>{inline(quote.join(" "))}</p>
        </aside>,
      );
      continue;
    }
    if (line.trim().startsWith("|")) {
      const rows: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        rows.push(lines[i]);
        i++;
      }
      const [head, , ...body] = rows;
      blocks.push(
        <div key={key()} className={styles.table} tabIndex={0}>
          <table>
            <thead>
              <tr>
                {cells(head).map((c, n) => (
                  <th key={n} scope="col">
                    {inline(c)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {body.map((r, rn) => (
                <tr key={rn}>
                  {cells(r).map((c, n) => (
                    <td key={n}>{inline(c, `t${rn}-${n}`)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }
    const listItem = /^(\d+\.|-)\s+/;
    if (listItem.test(line)) {
      const ordered = /^\d+\./.test(line);
      const items: string[] = [];
      while (i < lines.length && listItem.test(lines[i])) {
        items.push(lines[i].replace(listItem, ""));
        i++;
      }
      const Tag = ordered ? "ol" : "ul";
      blocks.push(
        <Tag key={key()} className={styles.list}>
          {items.map((item, n) => (
            <li key={n}>{inline(item, `l${n}`)}</li>
          ))}
        </Tag>,
      );
      continue;
    }
    const para: string[] = [];
    while (
      i < lines.length &&
      !isBlank(lines[i]) &&
      !/^(#{2,3}\s|!\[|>|\||-\s|\d+\.\s)/.test(lines[i])
    ) {
      para.push(lines[i]);
      i++;
    }
    blocks.push(
      <p key={key()} className={styles.p}>
        {inline(para.join(" "))}
      </p>,
    );
  }
  return <>{blocks}</>;
}
