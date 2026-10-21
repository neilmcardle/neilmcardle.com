import Link from "next/link";
import { AllWork } from "@/app/_home/Home";
import {
  CLIENTS,
  GROUP_LABEL,
  GROUP_ORDER,
  WORKS,
  slug,
} from "@/app/_home/data";
import home from "@/app/_home/home.module.css";
import Contact from "@/app/_orbit/Contact";
import ParticleMark from "@/app/_home/ParticleMark";
import ProfileMark from "@/app/_orbit/ProfileMark";
import Role from "@/app/_orbit/Role";
import orbit from "@/app/_orbit/orbit.module.css";
import { ITEMS } from "@/app/_orbit/OrbitHome";
import styles from "./column.module.css";
import ParticleRail from "./ParticleRail";
import SectionChips from "./SectionChips";
import WorkScroll from "./WorkScroll";
import XTab from "./XTab";

const WHOLE: Partial<Record<string, string>> = {
  tools: "tools",
  covers: "book-covers",
  paintings: "paintings",
  kids: "kids",
  books: "audiobook",
};

const EXTRA = [
  { id: "tools", name: "Tools", mark: "tools" as const },
  { id: "kids", name: "For my kids", mark: "kids" as const },
  { id: "audiobook", name: "Audiobook", mark: "audio" as const },
];

const RENAME: Partial<Record<string, string>> = {
  "n-particles": "Explorations",
};

const PAGE: { id: string; group: string }[] = [
  { id: "speakui", group: "demo" },
  ...GROUP_ORDER.flatMap((group) => {
    const whole = WHOLE[group];
    return whole
      ? [{ id: whole, group }]
      : WORKS.filter((work) => work.group === group).map((work) => ({
          id: slug(work.title),
          group,
        }));
  }),
];

const RAIL = PAGE.flatMap(({ id, group }) => {
  const item =
    ITEMS.find((entry) => entry.id === id) ??
    EXTRA.find((entry) => entry.id === id);
  return item
    ? [{ id, name: RENAME[id] ?? item.name, mark: item.mark, group }]
    : [];
});

const SECTIONS = [
  { key: "demo", label: "SpeakUI" },
  ...GROUP_ORDER.map((key) => ({ key, label: GROUP_LABEL[key] })),
];

export default function ColumnHome() {
  return (
    <div className={`${home.root} ${styles.page}`}>
      <div className={styles.column}>
        <header className={styles.head}>
          <span className={styles.homeMark} data-home-mark aria-hidden="true">
            <ParticleMark />
          </span>
          <h1 className={styles.brand}>
            <ProfileMark />
            <span className={orbit.identity}>
              <Link href="/" className={orbit.name}>
                Neil McArdle
              </Link>
              <Role />
            </span>
          </h1>
          <Contact desk={false} />
        </header>
        <SectionChips sections={SECTIONS} />
        <main className={styles.work}>
          <AllWork />
        </main>
        <footer className={styles.clients}>
          <p className={styles.clientsLabel}>Trusted by</p>
          <ul>
            {CLIENTS.map((client) => (
              <li key={client.name}>
                <img
                  src={client.logo}
                  alt={client.name}
                  style={{ height: client.height }}
                />
              </li>
            ))}
          </ul>
        </footer>
      </div>
      <ParticleRail items={RAIL} />
      <WorkScroll />
      <XTab />
    </div>
  );
}
