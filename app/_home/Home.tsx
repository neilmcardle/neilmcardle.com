"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { PAINTINGS } from "@/app/paintings/paintings";
import dynamic from "next/dynamic";
import CoverlyMocks from "@/components/home/CoverlyMocks";
import DoodleWireShots from "@/components/home/DoodleWireShots";
import MakeEbookMocks from "@/components/home/MakeEbookMocks";
import PinMark from "@/components/home/PinMark";
import PageCurl from "@/components/home/PageCurl";
import ProductMark, { type MarkKey } from "./ProductMark";
import styles from "./home.module.css";

const SparkMocks = dynamic(() => import("@/components/home/SparkMocks"), {
  ssr: false,
});

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
  books: "Audiobook",
  paintings: "Paintings",
};

const FILTERS: Filter[] = ["all", ...GROUP_ORDER];

const FILTER_LABEL: Record<Filter, string> = {
  all: "All work",
  ...GROUP_LABEL,
};

const WORKS: Work[] = [
  {
    title: "makeebook",
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
    title: "Tessera: The Triangle Game",
    group: "kids",
    sub: "Games",
    href: "https://apps.apple.com/gb/app/tessera-the-triangle-game/id6774786982",
    pills: ["Two players", "iOS"],
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
    ratio: 1149.1 / 154.29,
  },
  {
    name: "Mobbin",
    logo: "/logos/mobbin.svg",
    role: "Contractor",
    height: 16,
    ratio: 475 / 64,
  },
  {
    name: "The Banner of Truth",
    logo: "/logos/banner-of-truth.svg",
    role: "Previously",
    height: 28,
    ratio: 1033.2 / 353.7,
  },
];

const pad = (value: number) => String(value).padStart(3, "0");

function matches(work: Work, needle: string) {
  if (!needle) return true;
  return `${work.title} ${work.sub} ${work.pills.join(" ")} ${GROUP_LABEL[work.group]}`
    .toLowerCase()
    .includes(needle);
}

function reducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function Home() {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [replay, setReplay] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuClosing, setMenuClosing] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchClosing, setSearchClosing] = useState(false);
  const menuTimer = useRef<number | null>(null);
  const searchTimer = useRef<number | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const indexRefs = useRef<(HTMLButtonElement | null)[]>([]);

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
      if (menuTimer.current !== null) window.clearTimeout(menuTimer.current);
      if (searchTimer.current !== null)
        window.clearTimeout(searchTimer.current);
    },
    [],
  );

  const openMenu = () => {
    if (menuTimer.current !== null) window.clearTimeout(menuTimer.current);
    setMenuClosing(false);
    setMenuOpen(true);
  };

  const closeMenu = () => {
    if (reducedMotion()) {
      setMenuOpen(false);
      menuButtonRef.current?.focus();
      return;
    }
    setMenuClosing(true);
    menuButtonRef.current?.focus();
    if (menuTimer.current !== null) window.clearTimeout(menuTimer.current);
    menuTimer.current = window.setTimeout(() => {
      setMenuOpen(false);
      setMenuClosing(false);
    }, 320);
  };

  const openSearch = () => {
    if (searchTimer.current !== null) window.clearTimeout(searchTimer.current);
    setSearchClosing(false);
    setSearchOpen(true);
    requestAnimationFrame(() => searchRef.current?.focus());
  };

  const closeSearch = () => {
    if (reducedMotion()) {
      setSearchOpen(false);
      return;
    }
    setSearchClosing(true);
    if (searchTimer.current !== null) window.clearTimeout(searchTimer.current);
    searchTimer.current = window.setTimeout(() => {
      setSearchOpen(false);
      setSearchClosing(false);
    }, 360);
  };

  useEffect(() => {
    if (!menuOpen) return;
    const mobile = window.matchMedia("(max-width: 959px)");
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
    };
    const onChange = () => {
      if (!mobile.matches) {
        setMenuOpen(false);
        setMenuClosing(false);
      }
    };
    const html = document.documentElement;
    const previous = html.style.overflow;
    html.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    mobile.addEventListener("change", onChange);
    return () => {
      html.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
      mobile.removeEventListener("change", onChange);
    };
  }, [menuOpen]);

  useEffect(() => {
    const read = () => {
      const params = new URLSearchParams(window.location.search);
      const value = params.get("filter");
      setFilter(
        value && (FILTERS as string[]).includes(value)
          ? (value as Filter)
          : "all",
      );
      setQuery(params.get("q") ?? "");
    };
    read();
    window.addEventListener("popstate", read);
    return () => window.removeEventListener("popstate", read);
  }, []);

  const writeUrl = (next: Filter, text: string, push: boolean) => {
    const params = new URLSearchParams(window.location.search);
    if (next === "all") params.delete("filter");
    else params.set("filter", next);
    if (text) params.set("q", text);
    else params.delete("q");
    const search = params.toString();
    const url = `${window.location.pathname}${search ? `?${search}` : ""}`;
    if (push) window.history.pushState(null, "", url);
    else window.history.replaceState(null, "", url);
  };

  const search = (text: string) => {
    setQuery(text);
    writeUrl(filter, text, false);
  };

  useEffect(() => {
    if (!menuOpen || menuClosing) return;
    const index = Math.max(0, FILTERS.indexOf(filter));
    requestAnimationFrame(() => indexRefs.current[index]?.focus());
  }, [menuOpen, menuClosing, filter]);

  const choose = (next: Filter) => {
    if (next !== filter) writeUrl(next, query, true);
    setFilter(next);
    setReplay((count) => count + 1);
    if (menuOpen) closeMenu();
    const behavior = reducedMotion() ? "auto" : "smooth";
    const card = cardRef.current;
    if (card && card.scrollHeight > card.clientHeight + 1) {
      card.scrollTo({ top: 0, behavior });
    }
    if (window.scrollY > 0) {
      window.scrollTo({ top: 0, behavior });
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
    <div
      className={styles.root}
      data-menu={menuOpen ? (menuClosing ? "closing" : "open") : "closed"}
    >
      <a className={styles.skip} href="#home-work">
        Skip to work
      </a>
      <div className={styles.curlWrap}>
        <PageCurl />
      </div>
      <header className={styles.header}>
        <h1 className={styles.wordmark}>
          <span className={styles.mark}>
            <PinMark face="mark" size={64} zoom={4.7} spin={0.225} />
          </span>
          <Link href="/" className={styles.wordmarkLink}>
            <span className={styles.name}>Neil McArdle</span>
            <span className={styles.role}>Product Designer</span>
          </Link>
        </h1>
        <a
          className={styles.xPill}
          href="https://x.com/BetterNeil"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="@BetterNeil on X"
        >
          <svg
            className={styles.xLogo}
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          <span>@BetterNeil</span>
        </a>
        <EmailPill />
        <button
          ref={menuButtonRef}
          type="button"
          className={styles.menuButton}
          aria-expanded={menuOpen && !menuClosing}
          aria-controls="home-menu"
          aria-label={menuOpen && !menuClosing ? "Close menu" : "Open menu"}
          onClick={() => (menuOpen && !menuClosing ? closeMenu() : openMenu())}
        >
          <span className={styles.burger} aria-hidden="true">
            <span>
              <span />
            </span>
            <span>
              <span />
            </span>
          </span>
        </button>
      </header>

      <div className={styles.main}>
        <div id="home-menu" className={styles.aside}>
          <nav className={styles.index} aria-label="Filter work">
            <ul className={styles.indexList}>
              {FILTERS.map((key, index) => {
                return (
                  <li key={key}>
                    <button
                      ref={(element) => {
                        indexRefs.current[index] = element;
                      }}
                      type="button"
                      className={styles.indexButton}
                      aria-pressed={filter === key}
                      aria-label={FILTER_LABEL[key]}
                      onClick={() => choose(key)}
                      onKeyDown={(event) => onIndexKey(event, index)}
                    >
                      <span className={styles.indexCount} aria-hidden="true">
                        {pad(index)}
                      </span>
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
            <li className={styles.emailItem}>
              <span className={styles.metaLabel}>On X</span>
              <a
                href="https://x.com/BetterNeil"
                className={styles.emailLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                @BetterNeil
              </a>
            </li>
            {CLIENTS.map((client) => (
              <li key={client.name} className={styles.client}>
                <span className={styles.metaLabel}>{client.role}</span>
                <span className={styles.metaSlot}>
                  <img
                    className={styles.clientLogo}
                    src={client.logo}
                    alt={client.name}
                    width={Math.round(client.height * client.ratio)}
                    height={client.height}
                    style={{ height: client.height }}
                  />
                </span>
              </li>
            ))}
          </ul>
        </div>

        <section
          ref={cardRef}
          id="home-work"
          tabIndex={-1}
          className={styles.card}
          aria-labelledby="home-card-title"
          inert={menuOpen}
        >
          <div
            className={styles.cardHead}
            data-search={
              searchClosing
                ? "closing"
                : searchOpen || query
                  ? "open"
                  : "closed"
            }
          >
            <h2 id="home-card-title" className={styles.cardTitle}>
              <span className={styles.titlePhoto}>
                <Image
                  src="/hero/portrait.png"
                  alt=""
                  width={480}
                  height={480}
                  sizes="40px"
                  priority
                />
              </span>
              <span>Things I&rsquo;ve said and done</span>
            </h2>
            <button
              type="button"
              className={styles.searchToggle}
              aria-label="Search work"
              aria-expanded={(searchOpen || Boolean(query)) && !searchClosing}
              aria-controls="home-search"
              onClick={openSearch}
            >
              <SearchIcon className={styles.searchToggleIcon} />
            </button>
            <div className={styles.search}>
              <label htmlFor="home-search" className={styles.srOnly}>
                Search work
              </label>
              <input
                ref={searchRef}
                id="home-search"
                type="search"
                className={styles.searchInput}
                placeholder="Search…"
                autoComplete="off"
                value={query}
                onChange={(event) => search(event.target.value)}
                onBlur={() => {
                  if (!query && searchOpen && !searchClosing) closeSearch();
                }}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    search("");
                    closeSearch();
                  }
                }}
              />
              {query ? (
                <button
                  type="button"
                  className={styles.clear}
                  aria-label="Clear search"
                  onClick={() => search("")}
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
                  onClick={() => search("")}
                >
                  Clear search
                </button>
              </div>
            ) : (
              <div
                key={replay}
                className={replay > 0 ? styles.replay : undefined}
              >
                {filter === "all" && !query.trim() ? <Demo /> : null}
                {sections.map((section) => (
                  <section
                    key={section.key}
                    aria-label={GROUP_LABEL[section.key]}
                    className={styles.group}
                  >
                    <h3 className={styles.groupTitle}>
                      <span className={styles.groupCount} aria-hidden="true">
                        {pad(FILTERS.indexOf(section.key))}
                      </span>
                      <span>{GROUP_LABEL[section.key]}</span>
                    </h3>
                    {section.subs.map((sub) => (
                      <div key={sub.name} className={styles.sub}>
                        {MULTI_SUB.has(section.key) &&
                          sub.name !== "In progress" && (
                            <p className={styles.subTitle}>{sub.name}</p>
                          )}
                        {section.key === "products" ? (
                          <div className={styles.showcases}>
                            {sub.items.map((work) => (
                              <Showcase key={work.title} work={work} />
                            ))}
                          </div>
                        ) : section.key === "paintings" ? (
                          <Paintings
                            titles={sub.items.map((work) => work.title)}
                          />
                        ) : (
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
                        )}
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
          <span className={styles.linkIcons}>
            {appStore(work.href) && <AppleIcon className={styles.apple} />}
            {elevenReader(work.href) && <ElevenIcon className={styles.apple} />}
            <ExternalIcon className={styles.external} />
            <span className={styles.srOnly}>
              {appStore(work.href)
                ? " (App Store, "
                : elevenReader(work.href)
                  ? " (ElevenReader, "
                  : " ("}
              opens in a new tab)
            </span>
          </span>
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
      <span className={styles.metaLabel}>London</span>
      <span
        className={`${styles.metaSlot} ${styles.metaValue}`}
        style={now ? undefined : { visibility: "hidden" }}
      >
        {label}
      </span>
    </>
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

function appStore(href: string) {
  return href.startsWith("https://apps.apple.com/");
}

function elevenReader(href: string) {
  return href.startsWith("https://elevenreader.io/");
}

function ElevenIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 12 12"
      fill="currentColor"
      aria-hidden="true"
    >
      <rect x="3" y="1" width="2" height="10" rx="0.4" />
      <rect x="7" y="1" width="2" height="10" rx="0.4" />
    </svg>
  );
}

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
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

type ShowcaseInfo = {
  mark: MarkKey;
  what: string;
  note: string;
  label: string;
  type: string;
  status?: string;
  x?: string;
};

const SHOWCASE: Record<string, ShowcaseInfo> = {
  makeebook: {
    mark: "makeebook",
    what: "A peaceful place for authors to write their most thoughtful work.",
    note: "A web-based editor takes a manuscript to a store-ready ebook.",
    label: "makeebook.ink",
    type: "Writing platform",
    x: "makeebook",
  },
  DoodleWire: {
    mark: "doodlewire",
    what: "Wireframe from your phone.",
    note: "Just you, your phone and your imagination.",
    label: "App Store",
    type: "Wireframing tool, iOS",
  },
  Coverly: {
    mark: "coverly",
    what: "Be inspired to design your next book cover.",
    note: "A research tool for book cover designers.",
    label: "Visit",
    type: "Design research tool",
  },
  Spark: {
    mark: "spark",
    what: "A course for designers heading in the direction of design-engineer.",
    note: "Written by a designer, for designers.",
    label: "Visit",
    type: "Learning platform",
    status: "In progress",
  },
};

function ShowcaseMedia({ title }: { title: string }) {
  if (title === "makeebook")
    return (
      <>
        <MakeEbookMocks only="lockup" />
        <MakeEbookMocks only="rain" />
        <MakeEbookMocks only="video" />
        <video
          className={styles.film}
          src="/home/makeebook-promo.mp4"
          poster="/home/makeebook-promo.jpg"
          aria-label="makeebook product film"
          controls
          playsInline
          preload="none"
        />
      </>
    );
  if (title === "Spark")
    return (
      <>
        <SparkMocks only="intro" />
        <video
          className={styles.film}
          src="/home/spark-promo.mp4"
          poster="/home/spark-promo.jpg"
          aria-label="Spark course film"
          controls
          playsInline
          preload="none"
        />
      </>
    );
  if (title === "Coverly") return <CoverlyMocks />;
  if (title === "DoodleWire") return <DoodleWireShots />;
  return null;
}

function Showcase({ work }: { work: Work }) {
  const info = SHOWCASE[work.title];
  if (!info) return null;
  const external = work.href.startsWith("http");
  const linkProps = external ? { target: "_blank", rel: "noreferrer" } : {};

  return (
    <article className={styles.showcase}>
      <div className={styles.showcaseHead}>
        <a className={styles.showcaseName} href={work.href} {...linkProps}>
          <ProductMark mark={info.mark} className={styles.productMark} />
          <span translate="no">{work.title}</span>
        </a>
        <a className={styles.visit} href={work.href} {...linkProps}>
          {appStore(work.href) && <AppleIcon className={styles.apple} />}
          {info.label}
        </a>
      </div>
      <p className={styles.what}>{info.what}</p>
      <p className={styles.note}>{info.note}</p>
      <dl className={styles.facts}>
        <div>
          <dt>Type</dt>
          <dd>{info.type}</dd>
        </div>
        {info.status ? (
          <div>
            <dt>Status</dt>
            <dd>{info.status}</dd>
          </div>
        ) : null}
        {info.x ? (
          <div>
            <dt>On X</dt>
            <dd>
              <a className={styles.handle} href={`https://x.com/${info.x}`}>
                @{info.x}
              </a>
            </dd>
          </div>
        ) : null}
      </dl>
      <ShowcaseMedia title={work.title} />
    </article>
  );
}

function Paintings({ titles }: { titles: string[] }) {
  return (
    <div className={styles.paintings}>
      {PAINTINGS.filter((painting) => titles.includes(painting.title)).map(
        (painting) => (
          <article key={painting.slug} className={styles.painting}>
            <div
              className={styles.paintingImage}
              style={{ aspectRatio: painting.aspect ?? "4/5" }}
            >
              <Image
                src={painting.image}
                alt={painting.title}
                fill
                sizes="(max-width: 600px) 100vw, 240px"
              />
            </div>
            <div className={styles.paintingText}>
              <p className={styles.what}>{painting.title}</p>
              <p className={styles.paintingMeta}>
                <span>{painting.medium}</span>
                <span>{painting.dimensions}</span>
                <span>{painting.year}</span>
                {painting.status === "sold" && painting.acquiredYear ? (
                  <span className={styles.sold}>
                    <span className={styles.soldDot} aria-hidden="true" />
                    Sold to a{" "}
                    {(painting.collector ?? "collector").toLowerCase()} in{" "}
                    {painting.acquiredYear}.
                  </span>
                ) : null}
              </p>
              {painting.description.map((para) =>
                para.startsWith("> ") ? (
                  <blockquote key={para} className={styles.paintingQuote}>
                    {para.slice(2)}
                  </blockquote>
                ) : (
                  <p key={para} className={styles.paintingBody}>
                    {para}
                  </p>
                ),
              )}
            </div>
          </article>
        ),
      )}
    </div>
  );
}

function Demo() {
  return (
    <section className={styles.group} aria-labelledby="home-demo">
      <h3 id="home-demo" className={styles.groupTitle}>
        Product Demo on Dive Radio
      </h3>
      <article className={styles.showcase}>
        <p className={styles.demoNote}>
          A demo I recorded of Speak UI, played on Dive Radio with{" "}
          <a className={styles.handle} href="https://x.com/designertom">
            @designertom
          </a>{" "}
          and{" "}
          <a className={styles.handle} href="https://x.com/ridd_design">
            @ridd_design
          </a>
          , 24 September 2026. Describe the interface you want and it&rsquo;s
          built while you watch.
        </p>
        <video
          className={styles.film}
          src="/home/dive-radio-jit.mp4"
          poster="/home/dive-radio-jit.jpg"
          aria-label="Dive Radio, Just-in-Time Interfaces"
          controls
          playsInline
          preload="none"
        />
        <p className={styles.caption}>Above: Just-in-Time Interfaces</p>
      </article>
    </section>
  );
}
