"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./home.module.css";

const address = () => ["neil", ["neilmcardle", "com"].join(".")].join("@");

export default function Contact() {
  const [copied, setCopied] = useState(false);
  const timer = useRef(0);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(address());
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${address()}`;
    }
  };

  return (
    <p className={styles.links}>
      <button type="button" onClick={copy} aria-live="polite">
        {copied ? "Email copied" : "Copy email"}
      </button>
      <a href="https://www.linkedin.com/in/neilmcardle/">LinkedIn</a>
      <a href="https://x.com/BetterNeil">X</a>
      <a href="/suggest">Suggest a change</a>
    </p>
  );
}
