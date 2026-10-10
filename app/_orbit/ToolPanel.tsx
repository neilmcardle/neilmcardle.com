import Link from "next/link";
import AppIcon from "@/app/_home/AppIcon";
import GoLink from "@/app/_home/GoLink";
import type { Work } from "@/app/_home/data";
import home from "@/app/_home/home.module.css";
import styles from "./orbit.module.css";

export default function ToolPanel({
  work,
  what,
  image,
}: {
  work: Work;
  what: string;
  image: string;
}) {
  return (
    <article className={home.showcase}>
      <div className={home.showcaseHead}>
        <h3 className={`${home.showcaseName} ${styles.toolName}`}>
          {work.icon ? (
            <AppIcon
              icon={work.icon}
              className={`${home.appIcon} ${styles.toolIcon}`}
            />
          ) : null}
          {work.title}
        </h3>
        <GoLink href={work.href} label={`Open ${work.title}`} />
      </div>
      <p className={home.what}>{what}</p>
      <dl className={home.facts}>
        <div>
          <dt>Type</dt>
          <dd>{work.pills.join(", ")}</dd>
        </div>
        <div>
          <dt>Role</dt>
          <dd>Solo, design and build</dd>
        </div>
        <div>
          <dt>Runs</dt>
          <dd>{work.sub}</dd>
        </div>
      </dl>
      <Link
        className={styles.toolShot}
        href={work.href}
        aria-label={`Open ${work.title}`}
      >
        <img src={image} alt="" width={1200} height={750} loading="lazy" />
      </Link>
    </article>
  );
}
