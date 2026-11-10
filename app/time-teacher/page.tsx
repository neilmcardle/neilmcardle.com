"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import YboDial, { ORDER, wrapDial } from "@/app/time-teacher/YboDial";
import styles from "./time.module.css";

const ONES = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
  "thirteen",
  "fourteen",
  "fifteen",
  "sixteen",
  "seventeen",
  "eighteen",
  "nineteen",
];
const TENS = ["", "", "twenty", "thirty"];
const HOURS = [
  "twelve",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
];

function numberWord(n: number) {
  if (n < 20) return ONES[n];
  const rest = n % 10;
  return rest === 0
    ? TENS[Math.floor(n / 10)]
    : `${TENS[Math.floor(n / 10)]} ${ONES[rest]}`;
}

function phraseParts(hour: number, minutes: number) {
  const h = ((hour % 12) + 12) % 12;
  const next = (h + 1) % 12;
  if (minutes === 0) return [HOURS[h], "o'clock"];
  if (minutes === 30) return ["half", "past", HOURS[h]];
  if (minutes < 30) return [numberWord(minutes), "past", HOURS[h]];
  return [numberWord(60 - minutes), "to", HOURS[next]];
}

function nowSnapped() {
  const d = new Date();
  return wrapDial(
    Math.round(((d.getHours() % 12) * 60 + d.getMinutes()) / 5) * 5,
  );
}

export default function YboPage() {
  const [totalMinutes, setTotalMinutes] = useState(12 * 60 + 25);
  const [seconds, setSeconds] = useState(0);
  const [following, setFollowing] = useState(true);

  useEffect(() => {
    const tick = () => setSeconds(new Date().getSeconds());
    tick();
    const id = window.setInterval(tick, 200);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!following) return;
    const tick = () => setTotalMinutes(nowSnapped());
    tick();
    const id = window.setInterval(tick, 200);
    return () => window.clearInterval(id);
  }, [following]);

  const handleChange = useCallback((next: number) => {
    setFollowing(false);
    setTotalMinutes(next);
  }, []);

  const dial = wrapDial(totalMinutes);
  const hour = Math.floor(dial / 60);
  const minutes = dial % 60;
  const parts = phraseParts(hour, minutes);

  return (
    <main className={styles.root}>
      <style>{"html,body{background:#0d0d0c}"}</style>
      <header className={styles.bar}>
        <Link className={styles.home} href="/">
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M10 3 5 8l5 5" />
          </svg>
          Home
        </Link>
        <button
          type="button"
          className={styles.now}
          onClick={() => setFollowing(true)}
          aria-pressed={following}
        >
          <span className={styles.live} aria-hidden="true" />
          Show the time now
        </button>
      </header>

      <h1 className={styles.title}>
        <span className={styles.hidden}>Time Teacher: </span>
        <span aria-live="polite" className={styles.phrase}>
          {parts.map((part, i) => (
            <span
              key={part + i}
              style={{ color: ORDER[Math.min(i, ORDER.length - 1)] }}
            >
              {part}
              {i < parts.length - 1 ? " " : ""}
            </span>
          ))}
        </span>
      </h1>

      <YboDial
        totalMinutes={totalMinutes}
        seconds={seconds}
        onChange={handleChange}
        label="Clock time"
        valueText={parts.join(" ")}
        className={styles.dial}
      />

      <p className={styles.hint}>
        Drag a hand to set the time.
        <span className={styles.keys}> Arrow keys work too.</span>
      </p>
    </main>
  );
}
