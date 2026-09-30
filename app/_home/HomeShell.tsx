"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { LinkedInIcon } from "@/components/LinkedInIcon";
import PageCurl from "@/components/home/PageCurl";
import {
  CLIENTS,
  CONTACTS,
  type Contact,
  EMAIL,
  LINKEDIN,
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
import ParticleMark from "./ParticleMark";
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
      .filter(
        (work) =>
          work.group !== "products" &&
          work.group !== "covers" &&
          work.group !== "paintings",
      )
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
          <span className={styles.mark} data-home-mark>
            <ParticleMark />
          </span>
          <Link href="/" className={styles.wordmarkLink}>
            <span className={styles.name}>Neil McArdle</span>{" "}
            <span className={styles.role}>Product Designer in London</span>
          </Link>
        </h1>
        <div className={styles.links}>
          <a
            className={styles.iconButton}
            href="https://x.com/BetterNeil"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="@BetterNeil on X (opens in a new tab)"
          >
            <ContactIcon icon="x" />
          </a>
          <a
            className={styles.iconButton}
            href={LINKEDIN}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Neil McArdle on LinkedIn (opens in a new tab)"
          >
            <ContactIcon icon="linkedin" />
          </a>
          <EmailButton />
        </div>
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
            <li className={styles.emailItem}>
              <ContactList contacts={CONTACTS} />
            </li>
            <li className={styles.learning}>
              <a
                href="https://youtube.com/playlist?list=PLhQjrBD2T383q7Vn8QnTsVgSvyLpsqL_R"
                className={styles.learningLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  className={styles.learningThumb}
                  src="/home/cs50x.jpg"
                  alt=""
                  width={64}
                  height={40}
                />
                <span className={styles.learningCopy}>
                  <span className={styles.learningLabel}>
                    Currently listening to
                  </span>
                  <span className={styles.learningText}>
                    <span className={styles.ticker}>
                      <span className={styles.tickerPart}>
                        Computer Science and the Art of Programming (Harvard)
                      </span>
                      <span className={styles.tickerCopy} aria-hidden="true">
                        Computer Science and the Art of Programming (Harvard)
                      </span>
                    </span>
                  </span>
                </span>
                <span className={styles.srOnly}> (opens in a new tab)</span>
              </a>
            </li>
            <li className={styles.trusted}>
              <span className={styles.metaLabel}>Trusted by</span>
              <ul className={styles.clients}>
                {CLIENTS.map((client) => (
                  <li key={client.name}>
                    <img
                      className={styles.clientLogo}
                      src={client.logo}
                      alt={client.name}
                      width={Math.round(client.height * client.ratio)}
                      height={client.height}
                      style={
                        { "--logo-h": `${client.height}px` } as CSSProperties
                      }
                    />
                  </li>
                ))}
              </ul>
            </li>
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
            <p id="home-card-title" className={styles.cardTitle}>
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
            </p>
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

          <div className={styles.contact}>
            <ContactList contacts={CONTACTS} />
          </div>
        </section>
      </div>
    </div>
  );
}

function ContactList({ contacts }: { contacts: Contact[] }) {
  return (
    <ul className={styles.contactList}>
      {contacts.map((contact) => {
        const external = contact.href.startsWith("http");
        return (
          <li key={contact.icon}>
            <a
              href={contact.href}
              className={styles.contactLink}
              {...(external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
            >
              <ContactIcon icon={contact.icon} />
              <span className={styles.srOnly}>{contact.label}: </span>
              <span className={styles.contactText}>{contact.text}</span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}

function ContactIcon({ icon }: { icon: Contact["icon"] }) {
  if (icon === "linkedin")
    return <LinkedInIcon className={styles.contactIcon} aria-hidden="true" />;
  if (icon === "x")
    return (
      <svg
        className={styles.contactIcon}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    );
  return (
    <svg
      className={styles.contactIcon}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="M3.5 7l8.5 6 8.5-6" />
    </svg>
  );
}

function EmailButton() {
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
      className={styles.iconButton}
      onClick={copy}
      aria-label={`Copy email address, ${EMAIL}`}
    >
      <ContactIcon icon="email" />
      <span
        className={styles.iconTip}
        aria-hidden="true"
        data-show={copied || undefined}
      >
        {copied ? "Email copied" : "Copy email"}
      </span>
      <span className={styles.srOnly} aria-live="polite">
        {copied ? "Email copied" : ""}
      </span>
    </button>
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
