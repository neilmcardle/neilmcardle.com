"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { PAINTINGS } from "@/app/paintings/paintings";
import styles from "./v2.module.css";

type GroupKey = "products" | "tools" | "kids" | "books" | "paintings";
type Filter = "all" | GroupKey;

type Work = {
  title: string;
  group: GroupKey;
  sub: string;
  href: string;
  plain?: boolean;
  pills: string[];
};

const EMAIL = "neil@neilmcardle.com";

const GROUP_ORDER: GroupKey[] = [
  "products",
  "tools",
  "kids",
  "books",
  "paintings",
];

const GROUP_LABEL: Record<GroupKey, string> = {
  products: "Products",
  tools: "Tools",
  kids: "For my kids",
  books: "Books",
  paintings: "Paintings",
};

const FILTERS: Filter[] = ["all", ...GROUP_ORDER];

const FILTER_LABEL: Record<Filter, string> = {
  all: "All work",
  ...GROUP_LABEL,
};

const WORKS: Work[] = [
  {
    title: "makeEbook",
    group: "products",
    sub: "Shipped",
    href: "https://makeebook.ink",
    pills: ["Writing platform", "Web"],
  },
  {
    title: "Coverly",
    group: "products",
    sub: "Shipped",
    href: "/coverly",
    pills: ["Design research", "Web"],
  },
  {
    title: "DoodleWire",
    group: "products",
    sub: "Shipped",
    href: "https://apps.apple.com/us/app/doodlewire/id6771274835",
    pills: ["Wireframing", "iOS"],
  },
  {
    title: "Spark",
    group: "products",
    sub: "In progress",
    href: "/spark",
    pills: ["Learning platform", "Web"],
  },
  {
    title: "Vector Paint",
    group: "tools",
    sub: "In the browser",
    href: "/vector-paint",
    pills: ["Drawing", "SVG export"],
  },
  {
    title: "Icon Animator",
    group: "tools",
    sub: "In the browser",
    href: "/icon-animator",
    pills: ["Animation", "CSS export"],
  },
  {
    title: "Promptr",
    group: "tools",
    sub: "In the browser",
    href: "/promptr",
    pills: ["Prompt writing"],
  },
  {
    title: "Tessera",
    group: "kids",
    sub: "Games",
    href: "/tessera",
    pills: ["Two players"],
  },
  {
    title: "Kids Alphabet",
    group: "kids",
    sub: "Games",
    href: "/kids-alphabet/",
    plain: true,
    pills: ["Toddlers"],
  },
  {
    title: "Time Teacher",
    group: "kids",
    sub: "Learning",
    href: "/time-teacher/ybo",
    pills: ["Telling the time"],
  },
  {
    title: "Touchtype",
    group: "kids",
    sub: "Learning",
    href: "/touchtype",
    pills: ["Typing"],
  },
  {
    title: "Sol0",
    group: "books",
    sub: "Fiction",
    href: "https://elevenreader.io/audiobooks/sol0-audiobook/lDuTf0Co8szKJBdzzAnu",
    pills: ["Sci-fi novel", "Audiobook"],
  },
  ...PAINTINGS.map((painting) => ({
    title: painting.title,
    group: "paintings" as const,
    sub: painting.medium,
    href: "/paintings",
    pills: [
      String(painting.year),
      painting.status.charAt(0).toUpperCase() + painting.status.slice(1),
    ],
  })),
];

const MULTI_SUB = new Set(
  GROUP_ORDER.filter(
    (key) =>
      new Set(
        WORKS.filter((work) => work.group === key).map((work) => work.sub),
      ).size > 1,
  ),
);

const CLIENTS = [
  {
    name: "Avis Budget Group",
    logo: "/logos/avis-budget-group.svg",
    role: "In-house",
    height: 16,
  },
  {
    name: "Mobbin",
    logo: "/logos/mobbin.svg",
    role: "Contractor",
    height: 16,
  },
  {
    name: "The Banner of Truth",
    logo: "/logos/banner-of-truth.svg",
    role: "Previously",
    height: 28,
  },
];

const pad = (value: number) => String(value).padStart(3, "0");

function matches(work: Work, needle: string) {
  if (!needle) return true;
  return `${work.title} ${work.sub} ${work.pills.join(" ")} ${GROUP_LABEL[work.group]}`
    .toLowerCase()
    .includes(needle);
}

function countFor(works: Work[], key: Filter) {
  return key === "all"
    ? works.length
    : works.filter((work) => work.group === key).length;
}

function reducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function V2Home() {
  const [filter, setFilter] = useState<Filter>("all");
  const [preview, setPreview] = useState<GroupKey | null>(null);
  const [query, setQuery] = useState("");
  const [replay, setReplay] = useState(0);
  const cardRef = useRef<HTMLElement>(null);
  const groupRefs = useRef<Partial<Record<GroupKey, HTMLElement | null>>>({});
  const indexRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const previewTimer = useRef<number | null>(null);

  const needle = query.trim().toLowerCase();
  const searched = WORKS.filter((work) => matches(work, needle));
  const visible = searched.filter(
    (work) => filter === "all" || work.group === filter,
  );

  const sections = GROUP_ORDER.map((key) => {
    const subs: { name: string; items: Work[] }[] = [];
    for (const work of visible) {
      if (work.group !== key) continue;
      const existing = subs.find((sub) => sub.name === work.sub);
      if (existing) existing.items.push(work);
      else subs.push({ name: work.sub, items: [work] });
    }
    return { key, subs };
  }).filter((section) => section.subs.length > 0);

  useEffect(
    () => () => {
      if (previewTimer.current !== null)
        window.clearTimeout(previewTimer.current);
    },
    [],
  );

  const clearPreviewTimer = () => {
    if (previewTimer.current !== null) {
      window.clearTimeout(previewTimer.current);
      previewTimer.current = null;
    }
  };

  const startPreview = (key: Filter) => {
    clearPreviewTimer();
    if (key === "all") return;
    setPreview(key);
    const firstKey = sections[0]?.key;
    previewTimer.current = window.setTimeout(() => {
      if (filter !== "all") return;
      if (!window.matchMedia("(min-width: 960px)").matches) return;
      const group = groupRefs.current[key];
      if (!group) return;
      const rect = group.getBoundingClientRect();
      if (rect.top >= 96 && rect.top < window.innerHeight * 0.5) return;
      const top = key === firstKey ? 0 : rect.top + window.scrollY - 120;
      window.scrollTo({
        top: Math.max(0, top),
        behavior: reducedMotion() ? "auto" : "smooth",
      });
    }, 160);
  };

  const endPreview = () => {
    clearPreviewTimer();
    setPreview(null);
  };

  const choose = (next: Filter) => {
    clearPreviewTimer();
    setFilter(next);
    setPreview(null);
    setReplay((count) => count + 1);
    const card = cardRef.current;
    if (card && card.getBoundingClientRect().top < 96) {
      window.scrollTo({
        top: 0,
        behavior: reducedMotion() ? "auto" : "smooth",
      });
    }
  };

  const onIndexKey = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    const last = FILTERS.length - 1;
    const target =
      event.key === "ArrowDown"
        ? Math.min(index + 1, last)
        : event.key === "ArrowUp"
          ? Math.max(index - 1, 0)
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? last
              : -1;
    if (target < 0) return;
    event.preventDefault();
    indexRefs.current[target]?.focus();
  };

  let rowIndex = 0;

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <h1 className={styles.wordmark}>
          <Link href="/" className={styles.wordmarkLink}>
            <NMark className={styles.mark} />
            <span className={styles.name}>Neil McArdle</span>
            <span className={styles.role}>Product Designer</span>
          </Link>
        </h1>
        <nav className={styles.nav} aria-label="Site">
          <Link href="/paintings" className={styles.navLink}>
            Paintings
          </Link>
          <Link href="/archive" className={styles.navLink}>
            Archive
          </Link>
        </nav>
        <EmailPill />
      </header>

      <div className={styles.main}>
        <div className={styles.aside}>
          <nav className={styles.index} aria-label="Filter work">
            <ul className={styles.indexList}>
              {FILTERS.map((key, index) => {
                const count = countFor(searched, key);
                return (
                  <li key={key}>
                    <button
                      ref={(element) => {
                        indexRefs.current[index] = element;
                      }}
                      type="button"
                      className={styles.indexButton}
                      aria-pressed={filter === key}
                      aria-label={`${FILTER_LABEL[key]}, ${count}`}
                      onClick={() => choose(key)}
                      onKeyDown={(event) => onIndexKey(event, index)}
                      onMouseEnter={() => startPreview(key)}
                      onMouseLeave={endPreview}
                      onFocus={() => startPreview(key)}
                      onBlur={endPreview}
                    >
                      <span className={styles.indexCount}>{pad(count)}</span>
                      <span className={styles.indexLabel}>
                        {FILTER_LABEL[key]}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          <ul className={styles.meta}>
            <li className={styles.metaItem}>
              <LondonClock />
            </li>
            <li className={styles.emailItem}>
              <span className={styles.metaLabel}>Email</span>
              <a href={`mailto:${EMAIL}`} className={styles.emailLink}>
                {EMAIL}
              </a>
            </li>
            {CLIENTS.map((client) => (
              <li key={client.name} className={styles.client}>
                <span className={styles.metaLabel}>{client.role}</span>
                <img
                  className={styles.clientLogo}
                  src={client.logo}
                  alt={client.name}
                  style={{ height: client.height }}
                />
              </li>
            ))}
          </ul>
        </div>

        <section
          ref={cardRef}
          className={styles.card}
          aria-labelledby="v2-card-title"
        >
          <div className={styles.cardHead}>
            <h2 id="v2-card-title" className={styles.cardTitle}>
              Things I&rsquo;ve made
            </h2>
            <div className={styles.search}>
              <label htmlFor="v2-search" className={styles.srOnly}>
                Search work
              </label>
              <input
                id="v2-search"
                type="search"
                className={styles.searchInput}
                placeholder="Search..."
                autoComplete="off"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              {query ? (
                <button
                  type="button"
                  className={styles.clear}
                  aria-label="Clear search"
                  onClick={() => setQuery("")}
                >
                  <ClearIcon />
                </button>
              ) : (
                <SearchIcon className={styles.searchIcon} />
              )}
            </div>
          </div>

          <p className={styles.srOnly} aria-live="polite">
            {`Showing ${visible.length} of ${WORKS.length}`}
          </p>

          <div className={styles.list}>
            {sections.length === 0 ? (
              <div className={styles.empty}>
                <p className={styles.emptyText}>
                  Nothing
                  {filter === "all" ? "" : ` in ${GROUP_LABEL[filter]}`} matches
                  &ldquo;{query.trim()}&rdquo;.
                </p>
                <button
                  type="button"
                  className={styles.emptyAction}
                  onClick={() => setQuery("")}
                >
                  Clear search
                </button>
              </div>
            ) : (
              <div
                key={replay}
                className={replay > 0 ? styles.replay : undefined}
              >
                {sections.map((section) => (
                  <section
                    key={section.key}
                    ref={(element) => {
                      groupRefs.current[section.key] = element;
                    }}
                    aria-label={GROUP_LABEL[section.key]}
                    className={`${styles.group} ${
                      preview && filter === "all" && preview !== section.key
                        ? styles.dim
                        : ""
                    }`}
                  >
                    <h3 className={styles.groupTitle}>
                      {GROUP_LABEL[section.key]}
                    </h3>
                    {section.subs.map((sub) => (
                      <div key={sub.name} className={styles.sub}>
                        {MULTI_SUB.has(section.key) && (
                          <p className={styles.subTitle}>{sub.name}</p>
                        )}
                        <ul className={styles.rows}>
                          {sub.items.map((work) => (
                            <li
                              key={work.title}
                              className={styles.rowItem}
                              style={{
                                animationDelay: `${Math.min(rowIndex++, 14) * 32}ms`,
                              }}
                            >
                              <WorkLink work={work} />
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </section>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function WorkLink({ work }: { work: Work }) {
  const external = work.href.startsWith("http");
  const inner = (
    <>
      <span className={styles.rowTitle}>
        {work.title}
        {external && (
          <>
            <ExternalIcon className={styles.external} />
            <span className={styles.srOnly}> (opens in a new tab)</span>
          </>
        )}
      </span>
      <span className={styles.pills}>
        {work.pills.map((pill) => (
          <span key={pill} className={styles.pillTag}>
            {pill}
          </span>
        ))}
      </span>
    </>
  );

  if (external) {
    return (
      <a
        className={styles.rowLink}
        href={work.href}
        target="_blank"
        rel="noopener noreferrer"
      >
        {inner}
      </a>
    );
  }

  if (work.plain) {
    return (
      <a className={styles.rowLink} href={work.href}>
        {inner}
      </a>
    );
  }

  return (
    <Link className={styles.rowLink} href={work.href}>
      {inner}
    </Link>
  );
}

function EmailPill() {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      if (timer.current !== null) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 2400);
    } catch {
      window.location.href = `mailto:${EMAIL}`;
    }
  };

  return (
    <button
      type="button"
      className={styles.emailPill}
      onClick={copy}
      aria-label={`Copy email address, ${EMAIL}`}
    >
      <span className={styles.avatar}>
        <Image
          src="/hero/portrait.png"
          alt=""
          width={480}
          height={480}
          sizes="32px"
        />
      </span>
      <span className={styles.emailLabel}>
        <span className={copied ? styles.concealed : undefined}>
          <span className={styles.labelShort}>Copy email</span>
          <span className={styles.labelLong}>{EMAIL}</span>
        </span>
        <span className={copied ? undefined : styles.concealed}>
          Email copied
        </span>
      </span>
      <span className={styles.srOnly} aria-live="polite">
        {copied ? "Email copied" : ""}
      </span>
    </button>
  );
}

function LondonClock() {
  const [now, setNow] = useState<{ h: number; m: number } | null>(null);

  useEffect(() => {
    const format = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/London",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    });
    const read = () => {
      const parts = format.formatToParts(new Date());
      setNow({
        h: Number(parts.find((part) => part.type === "hour")?.value ?? 0),
        m: Number(parts.find((part) => part.type === "minute")?.value ?? 0),
      });
    };
    read();
    const id = window.setInterval(read, 15000);
    return () => window.clearInterval(id);
  }, []);

  const label = now
    ? `${String(now.h).padStart(2, "0")}:${String(now.m).padStart(2, "0")}`
    : "00:00";

  return (
    <>
      <svg className={styles.clock} viewBox="0 0 56 56" aria-hidden="true">
        <circle className={styles.clockFace} cx="28" cy="28" r="28" />
        <svg
          x="24.5"
          y="6"
          width="7"
          height="7"
          viewBox="18 18 27 27"
          className={styles.clockMark}
        >
          <path d="M45 45L32 31.2985V18H45V45Z" />
          <path d="M18 18L32 31.6343L32 45L18 45L18 18Z" />
        </svg>
        {now && (
          <>
            <line
              className={styles.hand}
              x1="28"
              y1="28"
              x2="28"
              y2="17"
              transform={`rotate(${(now.h % 12) * 30 + now.m * 0.5} 28 28)`}
            />
            <line
              className={styles.hand}
              x1="28"
              y1="28"
              x2="28"
              y2="10"
              transform={`rotate(${now.m * 6} 28 28)`}
            />
          </>
        )}
      </svg>
      <span className={styles.metaText}>
        <span className={styles.metaLabel}>London</span>
        <span
          className={styles.metaValue}
          style={now ? undefined : { visibility: "hidden" }}
        >
          {label}
        </span>
      </span>
    </>
  );
}

function NMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="18 18 27 27"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M45 45L32 31.2985V18H45V45Z" />
      <path d="M18 18L32 31.6343L32 45L18 45L18 18Z" />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="9" cy="9" r="6" />
      <path d="M13.5 13.5L17 17" />
    </svg>
  );
}

function ClearIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M4 4l8 8M12 4l-8 8" />
    </svg>
  );
}

function ExternalIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3.5 8.5l5-5M4.5 3.5h4v4" />
    </svg>
  );
}
