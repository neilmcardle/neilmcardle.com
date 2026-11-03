"use client";

import Link from "next/link";
import { useEffect, type ReactNode } from "react";
import { createSample } from "@/lib/coverly/sfx";
import Brand from "./Brand";
import styles from "./home.module.css";

const pop = createSample("/kids-alphabet/sounds/bubble-pop.mp3", () => true, {
  gap: 120,
  live: true,
});

export default function Chip({
  id,
  href,
  image,
  logo = false,
  right = false,
  children,
}: {
  right?: boolean;
  id: string;
  href: string;
  image: string;
  logo?: boolean;
  children: ReactNode;
}) {
  useEffect(() => pop.prime(), []);

  return (
    <Link
      className={right ? `${styles.chip} ${styles.right}` : styles.chip}
      href={href}
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") pop.play(0.2);
      }}
    >
      <img
        src={image}
        alt=""
        width={20}
        height={20}
        className={logo ? styles.chipLogo : undefined}
      />
      {children}
      <span className={styles.chipCard} aria-hidden="true">
        <Brand id={id} />
      </span>
    </Link>
  );
}
