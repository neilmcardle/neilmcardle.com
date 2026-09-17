import styles from "./home.module.css";

export default function PageCurl() {
  return (
    <button type="button" className={styles.curl} aria-label="Enter NeilOS">
      <span className={styles.curlUnder} />
      <span className={styles.curlFlap} />
    </button>
  );
}
