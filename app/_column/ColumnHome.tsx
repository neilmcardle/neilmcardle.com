import Link from "next/link";
import { AllWork } from "@/app/_home/Home";
import { CLIENTS } from "@/app/_home/data";
import home from "@/app/_home/home.module.css";
import Contact from "@/app/_orbit/Contact";
import ProfileMark from "@/app/_orbit/ProfileMark";
import Role from "@/app/_orbit/Role";
import orbit from "@/app/_orbit/orbit.module.css";
import styles from "./column.module.css";
import WorkScroll from "./WorkScroll";

export default function ColumnHome() {
  return (
    <div className={`${home.root} ${styles.page}`}>
      <div className={styles.column}>
        <header className={styles.head}>
          <h1 className={styles.brand}>
            <ProfileMark />
            <span className={orbit.identity}>
              <Link href="/" className={orbit.name}>
                Neil McArdle
              </Link>
              <Role />
            </span>
          </h1>
          <Contact />
        </header>
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
      <WorkScroll />
    </div>
  );
}
