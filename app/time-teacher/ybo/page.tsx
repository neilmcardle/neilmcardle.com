"use client";

import { useCallback, useEffect, useState } from "react";
import YboDial, { INK, ORDER, wrapDial } from "./YboDial";

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
    <main
      className="relative flex min-h-screen flex-col items-center justify-start gap-8 px-6 py-8"
      style={{ background: INK.page }}
    >
      <button
        type="button"
        onClick={() => setFollowing(true)}
        className="absolute right-6 top-6 rounded-full border border-stone-700 px-4 py-1.5 text-sm text-stone-400 transition-colors hover:border-stone-500 hover:text-stone-100"
      >
        Current time
      </button>

      <div className="flex flex-col items-center gap-5">
        <p
          aria-live="polite"
          className="min-h-[1.2em] font-serif text-3xl tracking-tight"
        >
          {parts.map((part, i) => (
            <span
              key={part + i}
              style={{ color: ORDER[Math.min(i, ORDER.length - 1)] }}
            >
              {part}
              {i < parts.length - 1 ? " " : ""}
            </span>
          ))}
        </p>
      </div>

      <YboDial
        totalMinutes={totalMinutes}
        seconds={seconds}
        onChange={handleChange}
        label={`The time is ${parts.join(" ")}`}
        className="h-auto w-[min(78vh,98vw)] focus:outline-none"
      />

      <p className="hidden text-xs text-stone-600 sm:block">
        Drag a hand to set the time. Arrow keys work too.
      </p>
    </main>
  );
}
