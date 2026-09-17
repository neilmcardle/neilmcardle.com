import styles from "./brand.module.css";

export function BrandLoader() {
  return (
    <div className={styles.loader} role="status" aria-label="Loading makeebook">
      <div className={styles.loaderMark} />
    </div>
  );
}
