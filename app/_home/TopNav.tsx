"use client";

import styles from "./home.module.css";

const ITEMS = [
  { id: "work", label: "Work" },
  { id: "play", label: "Playground" },
  { id: "contact", label: "Contact" },
];

export default function TopNav() {
  return (
    <nav className={styles.topNav} aria-label="Jump to">
      {ITEMS.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          onClick={(event) => {
            const target = document.getElementById(item.id);
            if (!target) return;
            event.preventDefault();
            const calm = window.matchMedia(
              "(prefers-reduced-motion: reduce)",
            ).matches;
            target.scrollIntoView({ behavior: calm ? "auto" : "smooth" });
            history.replaceState(null, "", `#${item.id}`);
          }}
        >
          {item.label}
        </a>
      ))}
    </nav>
  );
}
