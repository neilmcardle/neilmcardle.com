"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLastBrowse } from "@/lib/coverly/last-browse";
import { BoardsIcon } from "./boards-icon";
import { CoverflowIcon } from "./coverflow-icon";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";

type IconName = "grid" | "layout";
type NavItem = { href: string; label: string; icon?: IconName };

type IconComponent = React.ComponentType<{
  className?: string;
  strokeWidth?: number;
}>;

const ICON_HEIGHT = 16;

const ICONS: Record<IconName, { Comp: IconComponent; width: number }> = {
  grid: {
    Comp: CoverflowIcon,
    width: Math.round((129.32 / 104.82) * ICON_HEIGHT),
  },
  layout: {
    Comp: BoardsIcon,
    width: Math.round((104.58 / 104.79) * ICON_HEIGHT),
  },
};

const SPRING = {
  type: "spring" as const,
  stiffness: 420,
  damping: 36,
  mass: 0.9,
};

export function NavCapsule({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const browseHref = useLastBrowse();

  const isActive = (href: string) =>
    href === "/coverly/browse"
      ? pathname === "/coverly/browse"
      : pathname.startsWith(href);

  const activeIndex = items.findIndex((i) => isActive(i.href));
  const transition = reduceMotion ? { duration: 0 } : SPRING;

  const navRef = useRef<HTMLElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const settledRef = useRef(false);

  useEffect(() => {
    const nav = navRef.current;
    const pill = pillRef.current;
    if (!nav || !pill) return;

    const place = () => {
      const target = nav.querySelector<HTMLElement>("[data-nav-active]");
      if (!target) {
        pill.style.opacity = "0";
        return;
      }
      const n = nav.getBoundingClientRect();
      const t = target.getBoundingClientRect();
      pill.style.opacity = "1";
      pill.style.width = `${t.width}px`;
      pill.style.height = `${t.height}px`;
      pill.style.transform = `translate(${t.left - n.left}px, ${t.top - n.top}px)`;
      if (!settledRef.current) {
        settledRef.current = true;
        requestAnimationFrame(() => {
          pill.style.transition = reduceMotion
            ? "none"
            : "transform 380ms cubic-bezier(0.34, 1.4, 0.64, 1), width 380ms cubic-bezier(0.34, 1.4, 0.64, 1)";
        });
      }
    };

    place();
    const observer = new ResizeObserver(place);
    observer.observe(nav);
    for (const child of Array.from(nav.children)) observer.observe(child);
    window.addEventListener("resize", place);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", place);
    };
  }, [activeIndex, reduceMotion]);

  return (
    <nav
      ref={navRef}
      className="relative flex items-center gap-0.5 rounded-full border border-border/70 bg-card p-1 shadow-[0_1px_8px_rgba(0,0,0,0.06)]"
    >
      <span
        ref={pillRef}
        aria-hidden="true"
        style={{ opacity: 0 }}
        className="pointer-events-none absolute left-0 top-0 rounded-full bg-foreground"
      />
      {items.map((item, i) => {
        const active = i === activeIndex;
        const icon = item.icon ? ICONS[item.icon] : null;
        return (
          <Link
            key={item.href}
            href={item.href === "/coverly/browse" ? browseHref : item.href}
            data-fly-target={
              item.href === "/coverly/boards" ? "board" : undefined
            }
            aria-current={active ? "page" : undefined}
            data-nav-active={active ? "" : undefined}
            className={`relative flex items-center rounded-full py-1.5 pl-3.5 pr-4 text-sm font-medium transition-colors duration-200 ${
              active
                ? "text-background"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {icon && (
              <motion.span
                aria-hidden="true"
                className="relative z-10 grid overflow-hidden"
                initial={false}
                animate={{
                  width: active ? icon.width : 0,
                  opacity: active ? 1 : 0,
                  marginRight: active ? 6 : 0,
                }}
                transition={transition}
              >
                <icon.Comp className="h-4 w-auto shrink-0" strokeWidth={2.25} />
              </motion.span>
            )}

            <span className="relative z-10">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
