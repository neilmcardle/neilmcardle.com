import Link from "next/link";
import shell from "./signature.module.css";
import styles from "./header.module.css";

export default function Header({
  home = "/",
  brand = true,
  contact = "#contact",
}: {
  home?: string;
  brand?: boolean;
  contact?: string;
}) {
  return (
    <header className={`${shell.wrap} ${styles.header}`}>
      {brand ? (
        <Link className={styles.brand} href={home} aria-label="Neil McArdle">
          <svg viewBox="18 18 27 27" aria-hidden="true">
            <path d="M45 45L32 31.2985V18H45V45Z" />
            <path d="M18 18L32 31.6343L32 45L18 45L18 18Z" />
          </svg>
          <span className={styles.name}>Neil McArdle</span>
        </Link>
      ) : (
        <span />
      )}
      <nav className={styles.nav}>
        <Link href={`${home}#work`}>Work</Link>
        <Link href={`${home}#play`}>Playground</Link>
        <a href={contact}>Contact</a>
      </nav>
    </header>
  );
}
