"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import PinMark from "@/components/home/PinMark";
import PageCurl from "@/components/home/PageCurl";
import {
  CLIENTS,
  EMAIL,
  FILTER_LABEL,
  FILTERS,
  GROUP_LABEL,
  GROUP_ORDER,
  WORKS,
  matches,
  pad,
  slug,
  subKey,
  type Filter,
} from "./data";
import styles from "./home.module.css";

function reducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function HomeShell({ children }: { children: ReactNode }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [replay, setReplay] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!replay) return;
    listRef.current?.querySelectorAll(`.${styles.rowItem}`).forEach((row) =>
      row.getAnimations().forEach((animation) => {
        animation.cancel();
        animation.play();
      }),
    );
  }, [replay]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuClosing, setMenuClosing] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchClosing, setSearchClosing] = useState(false);
  const menuTimer = useRef<number | null>(null);
  const searchTimer = useRef<number | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const searchToggleRef = useRef<HTMLButtonElement>(null);
  const cardRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const indexRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const needle = query.trim().toLowerCase();
  const visible = useMemo(
    () =>
      WORKS.filter(
        (work) =>
          matches(work, needle) && (filter === "all" || work.group === filter),
      ),
    [needle, filter],
  );

  const hiddenCss = useMemo(() => {
    const scope = "#home-work";
    const shown = new Set(visible.map((work) => slug(work.title)));
    const hidden: string[] = [];
    const rules: string[] = [];
    const filtered = filter !== "all" || needle !== "";
    if (filtered) hidden.push(`${scope} [data-group="demo"]`);
    let firstGroup = !filtered;
    for (const key of GROUP_ORDER) {
      const items = WORKS.filter((work) => work.group === key);
      const keep = items.filter((work) => shown.has(slug(work.title)));
      if (keep.length === 0) {
        hidden.push(`${scope} [data-group="${key}"]`);
        continue;
      }
      if (!firstGroup) {
        rules.push(`${scope} [data-group="${key}"]{margin-top:32px}`);
        firstGroup = true;
      }
      let firstSub = true;
      for (const sub of new Set(items.map((work) => subKey(work)))) {
        const inSub = keep.filter((work) => subKey(work) === sub);
        if (inSub.length === 0) {
          hidden.push(`${scope} [data-sub="${sub}"]`);
          continue;
        }
        if (firstSub) {
          rules.push(`${scope} [data-sub="${sub}"]{margin-top:24px}`);
          firstSub = false;
        }
      }
      for (const work of items)
        if (!shown.has(slug(work.title)))
          hidden.push(`${scope} [data-item="${slug(work.title)}"]`);
    }
    visible
      .filter((work) => work.group !== "products" && work.group !== "paintings")
      .forEach((work, index) =>
        rules.push(
          `${scope} [data-item="${slug(work.title)}"]{--row:${Math.min(index, 14)}}`,
        ),
      );
    return (
      (hidden.length ? `${hidden.join(",")}{display:none}` : "") +
      rules.join("")
    );
  }, [visible, filter, needle]);

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

  const closeSearch = (refocus = false) => {
    const done = () => {
      setSearchOpen(false);
      setSearchClosing(false);
      if (refocus)
        requestAnimationFrame(() =>
          requestAnimationFrame(() => searchToggleRef.current?.focus()),
        );
    };
    if (searchTimer.current !== null) window.clearTimeout(searchTimer.current);
    if (reducedMotion()) {
      done();
      return;
    }
    setSearchClosing(true);
    searchTimer.current = window.setTimeout(done, 360);
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
                  sizes="28px"
                  priority
                />
              </span>
              <span>Things I&rsquo;ve said and done</span>
            </h2>
            <button
              ref={searchToggleRef}
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
                    closeSearch(true);
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
            <style>{hiddenCss}</style>
            {visible.length === 0 ? (
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
            ) : null}
            <div
              ref={listRef}
              className={replay > 0 ? styles.replay : undefined}
            >
              {children}
            </div>
          </div>
        </section>
      </div>
    </div>
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
