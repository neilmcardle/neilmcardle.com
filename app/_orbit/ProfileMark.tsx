import Image from "next/image";
import styles from "./orbit.module.css";

export default function ProfileMark() {
  return (
    <span className={styles.photo}>
      <Image
        src="/hero/portrait.png"
        alt=""
        width={480}
        height={480}
        sizes="40px"
        priority
      />
    </span>
  );
}
