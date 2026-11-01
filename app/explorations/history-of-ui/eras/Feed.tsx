"use client";

import { useEffect, useRef, useState } from "react";
import { hash, useActive } from "../lib";
import s from "./feed.module.css";

type Post = {
  id: number;
  who: string;
  text: string;
  ago: string;
  likes: number;
  pic: number | null;
};

const WHO = [
  "Maya Patel",
  "Tom Okafor",
  "Lena Fischer",
  "Sam Reyes",
  "Priya Nair",
  "Jonah Wells",
  "Aiko Tanaka",
  "Chris Doyle",
  "Rosa Lima",
  "Ben Hartley",
];
const SAYS = [
  "Anyone else still awake?",
  "Best sandwich of my life. No notes.",
  "New profile picture, be nice",
  "Can't believe it's already Thursday",
  "Watching the rain from the office window again",
  "Who's coming on Saturday? Need numbers",
  "Ran 5k this morning and I've told everyone",
  "Found my old Game Boy in the loft",
  "Is it just me or is this week lasting a month",
  "The cat has claimed the laptop. Working from the sofa",
  "Throwback to last summer",
  "Some news soon. Can't say yet",
  "Tried the new place on the high street. Worth the queue",
  "Gig tonight was unreal",
  "Day 3 of not checking my phone in the morning. Mostly",
];
const PICS = [
  ["#f6a05b", "#d9485f"],
  ["#5bb0f6", "#3b4fd9"],
  ["#7fd69b", "#2f8a6a"],
  ["#f6d65b", "#e07a2f"],
  ["#c39bf2", "#5a3fc0"],
];

function make(id: number): Post {
  const h = hash(id, 3);
  return {
    id,
    who: WHO[Math.floor(hash(id, 1) * WHO.length)],
    text: SAYS[Math.floor(hash(id, 2) * SAYS.length)],
    ago: id < 0 ? "Just now" : `${1 + Math.floor(h * 50)} min`,
    likes: Math.floor(hash(id, 4) * 40),
    pic: hash(id, 5) < 0.35 ? Math.floor(hash(id, 6) * PICS.length) : null,
  };
}

function initials(n: string) {
  return n
    .split(" ")
    .map((x) => x[0])
    .join("");
}

function PostCard({ p }: { p: Post }) {
  const [liked, setLiked] = useState(false);
  return (
    <article className={s.post}>
      <header>
        <span
          className={s.avatar}
          style={{ background: `hsl(${(p.who.length * 47) % 360} 55% 55%)` }}
          aria-hidden
        >
          {initials(p.who)}
        </span>
        <span>
          <b>{p.who}</b>
          <small>{p.ago}</small>
        </span>
      </header>
      <p>{p.text}</p>
      {p.pic != null && (
        <div
          className={s.pic}
          style={{
            background: `linear-gradient(135deg, ${PICS[p.pic][0]}, ${PICS[p.pic][1]})`,
          }}
          aria-hidden
        />
      )}
      <footer>
        <button
          type="button"
          className={s.like}
          aria-pressed={liked}
          onClick={() => setLiked((l) => !l)}
        >
          <svg viewBox="0 0 24 24" aria-hidden>
            <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />
          </svg>
          {p.likes + (liked ? 1 : 0)}
        </button>
        <span className={s.comment}>Comment</span>
      </footer>
    </article>
  );
}

export default function Feed() {
  const active = useActive();
  const [posts, setPosts] = useState<Post[]>(() =>
    Array.from({ length: 12 }, (_, i) => make(i)),
  );
  const [waiting, setWaiting] = useState(0);
  const [badge, setBadge] = useState(2);
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [seen, setSeen] = useState(0);
  const [loading, setLoading] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const sentinel = useRef<HTMLDivElement>(null);
  const fresh = useRef(-1);
  const drag = useRef<{ y: number } | null>(null);
  const pullRef = useRef(0);

  pullRef.current = pull;

  useEffect(() => {
    if (!active) return;
    const t = window.setInterval(() => setSeconds((x) => x + 1), 1000);
    const n = window.setInterval(() => {
      setWaiting((w) => w + 1 + Math.floor(Math.random() * 2));
      setBadge((b) => b + 1);
    }, 6500);
    return () => {
      window.clearInterval(t);
      window.clearInterval(n);
    };
  }, [active]);

  useEffect(() => {
    const root = scroller.current;
    const el = sentinel.current;
    if (!root || !el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        setLoading(true);
        window.setTimeout(() => {
          setPosts((ps) => [
            ...ps,
            ...Array.from({ length: 10 }, (_, i) =>
              make(ps[ps.length - 1].id + 1 + i),
            ),
          ]);
          setLoading(false);
        }, 500);
      },
      { root, rootMargin: "0px 0px 300px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const refresh = () => {
    setRefreshing(true);
    setPull(56);
    window.setTimeout(() => {
      const count = Math.max(2, waiting);
      const add = Array.from({ length: count }, () => make(fresh.current--));
      setPosts((ps) => [...add, ...ps]);
      setWaiting(0);
      setRefreshing(false);
      setPull(0);
    }, 900);
  };

  const refreshRef = useRef(refresh);
  refreshRef.current = refresh;

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    let startY: number | null = null;
    const onStart = (e: TouchEvent) => {
      startY = el.scrollTop <= 0 ? e.touches[0].clientY : null;
    };
    const onMove = (e: TouchEvent) => {
      if (startY == null) return;
      const dy = e.touches[0].clientY - startY;
      if (dy > 0 && el.scrollTop <= 0) {
        e.preventDefault();
        setPull(Math.min(90, dy * 0.5));
      }
    };
    const onEnd = () => {
      if (startY == null) return;
      startY = null;
      if (pullRef.current > 50) refreshRef.current();
      else setPull(0);
    };
    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchmove", onMove, { passive: false });
    el.addEventListener("touchend", onEnd);
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove", onMove);
      el.removeEventListener("touchend", onEnd);
    };
  }, []);

  const mm = Math.floor(seconds / 60);
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div className={s.wrap}>
      <div className={s.app}>
        <div className={s.bar}>
          <span className={s.logo}>friendly</span>
          <span className={s.bell} aria-label={`${badge} notifications`}>
            <svg viewBox="0 0 24 24" aria-hidden>
              <path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 20a2 2 0 0 0 4 0" />
            </svg>
            {badge > 0 && <i>{badge > 99 ? "99+" : badge}</i>}
          </span>
        </div>
        <div
          ref={scroller}
          className={s.scroller}
          onScroll={(e) => {
            const el = e.currentTarget;
            const ratio = (el.scrollTop + el.clientHeight) / el.scrollHeight;
            setSeen((x) => Math.max(x, Math.round(ratio * posts.length)));
          }}
          onPointerDown={(e) => {
            if (
              e.pointerType !== "mouse" ||
              scroller.current!.scrollTop > 0 ||
              refreshing
            )
              return;
            if ((e.target as HTMLElement).closest("button")) return;
            drag.current = { y: e.clientY };
            e.currentTarget.setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => {
            if (!drag.current) return;
            setPull(
              Math.max(0, Math.min(90, (e.clientY - drag.current.y) * 0.5)),
            );
          }}
          onPointerUp={() => {
            if (!drag.current) return;
            drag.current = null;
            if (pull > 50) refresh();
            else setPull(0);
          }}
        >
          <div className={s.puller} style={{ height: pull }} aria-hidden>
            <span
              className={s.spinner}
              data-spin={refreshing || undefined}
              style={{ transform: `rotate(${pull * 4}deg)` }}
            />
            <small>
              {refreshing
                ? "Loading…"
                : pull > 50
                  ? "Release to refresh"
                  : "Pull down to refresh"}
            </small>
          </div>
          {waiting > 0 && !refreshing && (
            <button
              type="button"
              className={s.newPill}
              onClick={() => {
                scroller.current!.scrollTop = 0;
                refresh();
              }}
            >
              ↑ {waiting} new {waiting === 1 ? "post" : "posts"}
            </button>
          )}
          {posts.map((p) => (
            <PostCard key={p.id} p={p} />
          ))}
          <div ref={sentinel} className={s.more}>
            {loading ? "Loading more…" : ""}
          </div>
        </div>
      </div>
      <div className={s.meter} aria-live="off">
        <span>
          Time in feed{" "}
          <b>
            {mm}:{ss}
          </b>
        </span>
        <span>
          Posts seen <b>{seen}</b>
        </span>
        <span>
          Posts loaded <b>{posts.length}</b>
        </span>
      </div>
    </div>
  );
}
