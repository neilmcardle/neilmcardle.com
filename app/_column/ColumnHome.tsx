import Link from "next/link";
import { AllWork } from "@/app/_home/Home";
import { CLIENTS } from "@/app/_home/data";
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

const EXTRA = [
  { id: "avis", name: "Avis", mark: "avis" as const },
  { id: "tools", name: "Tools", mark: "tools" as const },
  { id: "kids", name: "For my kids", mark: "kids" as const },
  { id: "audiobook", name: "Audiobook", mark: "audio" as const },
];

const RENAME: Partial<Record<string, string>> = {
  "n-particles": "Explorations",
};

const WORK_IDS = ["avis", "makeebook", "coverly", "doodlewire", "book-covers"];

const PLAY_IDS = [
  "spark",
  "podium",
  "speakui",
  "n-particles",
  "tools",
  "kids",
  "audiobook",
  "paintings",
];

const RAIL = [...WORK_IDS, ...PLAY_IDS].flatMap((id) => {
  const item =
    ITEMS.find((entry) => entry.id === id) ??
    EXTRA.find((entry) => entry.id === id);
  return item
    ? [
        {
          id,
          name: RENAME[id] ?? item.name,
          mark: item.mark,
          divide: id === PLAY_IDS[0],
        },
      ]
    : [];
});

const SECTIONS = [
  { key: "work", label: "Work" },
  { key: "playground", label: "Playground" },
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
