import Image from "next/image";
import styles from "./brand.module.css";

export function Mark({ className }: { className?: string }) {
  return (
    <Image
      src="/make-ebook/brand/mark.svg"
      alt=""
      width={82}
      height={30}
      aria-hidden="true"
      className={className}
    />
  );
}

export function Wordmark() {
  return (
    <>
      <Mark className={styles.mark} />
      <span className={styles.wordmark}>makeebook</span>
    </>
  );
}
