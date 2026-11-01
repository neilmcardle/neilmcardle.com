"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "../lib";
import s from "./prompt.module.css";

type Kind = "dinner" | "convert" | "split" | "list";
type Turn = {
  id: number;
  ask: string;
  kind: Kind;
  reply: string;
  seed: Record<string, number | string>;
};

const SUGGESTIONS = [
  "Plan dinner for six on Friday",
  "Convert 3 cups of flour to grams",
  "Split an £84 bill four ways with a tip",
];

const WORDS: Record<string, number> = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  twelve: 12,
};

function firstNumber(t: string) {
  const m = t.match(/(\d+(?:\.\d+)?)/);
  if (m) return Number(m[1]);
  const w = t
    .toLowerCase()
    .split(/\W+/)
    .find((x) => WORDS[x]);
  return w ? WORDS[w] : null;
}

function interpret(ask: string, id: number): Turn {
  const t = ask.toLowerCase();
  if (/(split|bill|tip|share the cost|owe)/.test(t)) {
    const amount = Number(t.match(/[£$€]?\s?(\d+(?:\.\d+)?)/)?.[1] ?? 60);
    const ways = t.match(/(\w+) ways/)?.[1];
    const people = ways ? Number(ways) || WORDS[ways] || 4 : 4;
    return {
      id,
      ask,
      kind: "split",
      reply: `Here's a splitter for £${amount}. Change the tip or the headcount and everyone's share updates.`,
      seed: { amount, people },
    };
  }
  if (/(convert|cups?|grams?|ounces?|oz|ml|tbsp|teaspoon|tablespoon)/.test(t)) {
    const ing =
      ["sugar", "butter", "rice", "flour"].find((x) => t.includes(x)) ??
      "flour";
    return {
      id,
      ask,
      kind: "convert",
      reply: `${ing[0].toUpperCase() + ing.slice(1)} weighs about ${DENSITY[ing]} g a cup, so I've made you a converter for it.`,
      seed: { cups: firstNumber(t) ?? 1, ing },
    };
  }
  if (/(dinner|lunch|party|guests|cook|meal|friends over)/.test(t)) {
    const guests = firstNumber(t) ?? 6;
    return {
      id,
      ask,
      kind: "dinner",
      reply: `A plan for ${guests}. The shopping list scales when the guest count changes.`,
      seed: { guests },
    };
  }
  const items = ask
    .replace(
      /^(remind me to|i need to|help me|can you|please|todo:?|to do:?)/i,
      "",
    )
    .split(/,|\band\b|\bthen\b|;/i)
    .map((x) => x.trim())
    .filter(Boolean)
    .slice(0, 6);
  return {
    id,
    ask,
    kind: "list",
    reply: "I turned that into a list you can tick off.",
    seed: { items: JSON.stringify(items.length ? items : [ask]) },
  };
}

const DENSITY: Record<string, number> = {
  flour: 125,
  sugar: 200,
  butter: 227,
  rice: 185,
};

function Stepper({
  value,
  set,
  min = 1,
  max = 20,
  label,
}: {
  value: number;
  set: (n: number) => void;
  min?: number;
  max?: number;
  label: string;
}) {
  return (
    <div className={s.stepper} role="group" aria-label={label}>
      <button
        type="button"
        onClick={() => set(Math.max(min, value - 1))}
        aria-label={`Fewer ${label}`}
      >
        –
      </button>
      <output>{value}</output>
      <button
        type="button"
        onClick={() => set(Math.min(max, value + 1))}
        aria-label={`More ${label}`}
      >
        +
      </button>
    </div>
  );
}

function Dinner({ guests: g0 }: { guests: number }) {
  const [guests, setGuests] = useState(g0);
  const [done, setDone] = useState<Set<number>>(new Set());
  const shop = [
    { item: "Chicken thighs", per: 2, unit: "" },
    { item: "Lemons", per: 0.5, unit: "" },
    { item: "New potatoes", per: 200, unit: "g" },
    { item: "Green beans", per: 80, unit: "g" },
    { item: "Double cream", per: 50, unit: "ml" },
  ];
  const plan = [
    "Thursday: shop and marinate the chicken",
    "Friday 5pm: potatoes in the oven",
    "Friday 6:30pm: chicken in, set the table",
    "Friday 7:15pm: beans and sauce",
  ];
  const fmt = (n: number, u: string) =>
    u ? `${Math.round(n / 10) * 10}${u}` : String(Math.ceil(n));
  return (
    <div className={s.card}>
      <div className={s.cardHead}>
        <div>
          <h4>Friday dinner</h4>
          <p>Roast lemon chicken, potatoes, beans</p>
        </div>
        <label className={s.inline}>
          Guests
          <Stepper value={guests} set={setGuests} label="guests" />
        </label>
      </div>
      <div className={s.cols}>
        <section>
          <h5>Shopping</h5>
          <ul className={s.shop}>
            {shop.map((x) => (
              <li key={x.item}>
                <span>{x.item}</span>
                <b>{fmt(x.per * guests, x.unit)}</b>
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h5>Timeline</h5>
          <ul className={s.checks}>
            {plan.map((p, i) => (
              <li key={p}>
                <label>
                  <input
                    type="checkbox"
                    checked={done.has(i)}
                    onChange={() =>
                      setDone((d) => {
                        const n = new Set(d);
                        if (n.has(i)) n.delete(i);
                        else n.add(i);
                        return n;
                      })
                    }
                  />
                  <span>{p}</span>
                </label>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

function Convert({ cups: c0, ing: i0 }: { cups: number; ing: string }) {
  const [cups, setCups] = useState(String(c0));
  const [ing, setIng] = useState(i0);
  const n = Number(cups);
  const grams = Number.isFinite(n) ? Math.round(n * DENSITY[ing]) : 0;
  return (
    <div className={s.card}>
      <div className={s.convert}>
        <label>
          <span>Cups</span>
          <input
            inputMode="decimal"
            value={cups}
            onChange={(e) => setCups(e.target.value)}
            aria-label="Cups"
          />
        </label>
        <span className={s.eq} aria-hidden>
          =
        </span>
        <div className={s.result} aria-live="polite">
          <span>Grams</span>
          <strong>{grams}</strong>
        </div>
      </div>
      <div className={s.chips} role="radiogroup" aria-label="Ingredient">
        {Object.keys(DENSITY).map((k) => (
          <button
            key={k}
            type="button"
            role="radio"
            aria-checked={ing === k}
            onClick={() => setIng(k)}
          >
            {k}
          </button>
        ))}
      </div>
    </div>
  );
}

function Split({ amount: a0, people: p0 }: { amount: number; people: number }) {
  const [amount, setAmount] = useState(String(a0));
  const [people, setPeople] = useState(p0);
  const [tip, setTip] = useState(12.5);
  const total = (Number(amount) || 0) * (1 + tip / 100);
  const each = total / people;
  return (
    <div className={s.card}>
      <div className={s.split}>
        <label>
          <span>Bill</span>
          <span className={s.money}>
            £
            <input
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              aria-label="Bill amount"
            />
          </span>
        </label>
        <label>
          <span>People</span>
          <Stepper value={people} set={setPeople} label="people" />
        </label>
        <label className={s.tipRow}>
          <span>Tip {tip}%</span>
          <input
            type="range"
            min={0}
            max={25}
            step={2.5}
            value={tip}
            onChange={(e) => setTip(Number(e.target.value))}
          />
        </label>
      </div>
      <div className={s.each} aria-live="polite">
        <span>Each person pays</span>
        <strong>£{each.toFixed(2)}</strong>
        <small>Total £{total.toFixed(2)}</small>
      </div>
    </div>
  );
}

function List({ items }: { items: string[] }) {
  const [done, setDone] = useState<Set<number>>(new Set());
  return (
    <div className={s.card}>
      <ul className={s.checks}>
        {items.map((it, i) => (
          <li key={i}>
            <label>
              <input
                type="checkbox"
                checked={done.has(i)}
                onChange={() =>
                  setDone((d) => {
                    const n = new Set(d);
                    if (n.has(i)) n.delete(i);
                    else n.add(i);
                    return n;
                  })
                }
              />
              <span>{it[0]?.toUpperCase() + it.slice(1)}</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Answer({ turn, onSettled }: { turn: Turn; onSettled: () => void }) {
  const reduced = usePrefersReducedMotion();
  const words = turn.reply.split(" ");
  const [n, setN] = useState(0);
  const [built, setBuilt] = useState(false);
  const settled = useRef(onSettled);
  settled.current = onSettled;

  useEffect(() => {
    if (reduced) {
      setN(words.length);
      setBuilt(true);
      settled.current();
      return;
    }
    let i = 0;
    const id = window.setInterval(() => {
      i++;
      setN(i);
      settled.current();
      if (i >= words.length) {
        window.clearInterval(id);
        window.setTimeout(() => {
          setBuilt(true);
          settled.current();
        }, 650);
      }
    }, 45);
    return () => window.clearInterval(id);
  }, [reduced, words.length]);

  const streaming = n < words.length;
  return (
    <div className={s.answer}>
      <p>
        {words.slice(0, n).join(" ")}
        {streaming && <span className={s.cursor} aria-hidden />}
      </p>
      {!streaming && !built && (
        <div className={s.skeleton} aria-hidden>
          <i />
          <i />
          <i />
        </div>
      )}
      {built && (
        <div className={s.built}>
          {turn.kind === "dinner" && (
            <Dinner guests={Number(turn.seed.guests)} />
          )}
          {turn.kind === "convert" && (
            <Convert
              cups={Number(turn.seed.cups)}
              ing={String(turn.seed.ing)}
            />
          )}
          {turn.kind === "split" && (
            <Split
              amount={Number(turn.seed.amount)}
              people={Number(turn.seed.people)}
            />
          )}
          {turn.kind === "list" && (
            <List items={JSON.parse(String(turn.seed.items))} />
          )}
          <p className={s.note}>
            This interface didn&apos;t exist until you asked for it.
          </p>
        </div>
      )}
    </div>
  );
}

export default function Prompt() {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [text, setText] = useState("");
  const thread = useRef<HTMLDivElement>(null);
  const nextId = useRef(1);

  const ask = (q: string) => {
    const v = q.trim();
    if (!v) return;
    setTurns((t) => [...t, interpret(v, nextId.current++)]);
    setText("");
  };

  const follow = () => {
    const el = thread.current;
    if (el) el.scrollTop = el.scrollHeight;
  };

  return (
    <div className={s.app}>
      <div ref={thread} className={s.thread}>
        {turns.length === 0 ? (
          <div className={s.empty}>
            <h3>What do you need?</h3>
            <div className={s.suggest}>
              {SUGGESTIONS.map((x) => (
                <button key={x} type="button" onClick={() => ask(x)}>
                  {x}
                </button>
              ))}
            </div>
          </div>
        ) : (
          turns.map((t) => (
            <div key={t.id} className={s.turn}>
              <div className={s.me}>{t.ask}</div>
              <Answer turn={t} onSettled={follow} />
            </div>
          ))
        )}
      </div>
      <form
        className={s.composer}
        onSubmit={(e) => {
          e.preventDefault();
          ask(text);
        }}
      >
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              ask(text);
            }
          }}
          rows={1}
          placeholder={
            turns.length ? "Ask for something else" : "Describe what you need"
          }
          aria-label="Message"
        />
        <button type="submit" disabled={!text.trim()} aria-label="Send">
          <svg viewBox="0 0 24 24" aria-hidden>
            <path d="M12 19V5M6 11l6-6 6 6" />
          </svg>
        </button>
      </form>
      {turns.length > 0 && (
        <div className={s.more}>
          {SUGGESTIONS.filter((x) => !turns.some((t) => t.ask === x)).map(
            (x) => (
              <button key={x} type="button" onClick={() => ask(x)}>
                {x}
              </button>
            ),
          )}
        </div>
      )}
    </div>
  );
}
