import { LOGOMARK_PATH, LOGOMARK_VIEWBOX } from "@/app/coverly/logomark";
import styles from "./brand.module.css";

export default function Brand({ id }: { id: string }) {
  if (id === "makeebook")
    return (
      <span className={`${styles.face} ${styles.makeebook}`}>
        <img
          src="/make-ebook/brand/mark.svg"
          alt=""
          className={styles.mkMark}
        />
        <span className={styles.name}>makeebook</span>
      </span>
    );
  if (id === "coverly")
    return (
      <span className={`${styles.face} ${styles.coverly}`}>
        <svg
          viewBox={LOGOMARK_VIEWBOX}
          className={styles.cvMark}
          aria-hidden="true"
        >
          <path d={LOGOMARK_PATH} />
        </svg>
        <span className={styles.name}>coverly</span>
      </span>
    );
  if (id === "avis")
    return (
      <span className={`${styles.face} ${styles.avis}`}>
        <span className={styles.avisLogo}>
          <img src="/work/avis/hero-logo.jpg" alt="" />
        </span>
        <span className={styles.sub}>Checkout</span>
      </span>
    );
  if (id === "podium")
    return (
      <span className={`${styles.face} ${styles.podium}`}>
        <img src="/home/podium/logo.png" alt="" className={styles.podLogo} />
      </span>
    );
  if (id === "doodlewire")
    return (
      <span className={`${styles.face} ${styles.doodlewire}`}>
        <span className={styles.dwLogo}>
          <img src="/work/doodlewire/lockup.jpg" alt="" />
        </span>
      </span>
    );
  if (id === "mobbin")
    return (
      <span className={`${styles.face} ${styles.mobbin}`}>
        <img src="/logos/mobbin.svg" alt="" className={styles.mbLogo} />
        <span className={styles.sub}>Contractor, in the evenings</span>
      </span>
    );
  return null;
}
