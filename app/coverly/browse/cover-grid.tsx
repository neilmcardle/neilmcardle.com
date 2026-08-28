"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Heart, X } from "lucide-react";
import { LayoutGroup, motion } from "framer-motion";
import { SimilarCovers, rowMetrics } from "./similar-covers";
import { TunerPanel } from "./tuner-panel";
import { DOCK_FIELDS, DOCK_TITLE, FLY_FIELDS, FLY_TITLE } from "./tuner-fields";
import { dockTuner, useDockConfig } from "@/lib/coverly/dock-config";
import { flyTuner } from "@/lib/coverly/fly-config";
import { flyToBoard } from "@/lib/coverly/board-fly";
import {
  fetchCoverDetail,
  fetchSimilarCovers,
  loadMoreCovers,
  type CoverDetailData,
} from "./actions";
import {
  PAGE_SIZE,
  type CoverCard as CoverCardType,
  type CoverFilters,
} from "@/lib/coverly/queries";
import { AddToBoard } from "./add-to-board";
import { HeartButton } from "./heart-button";
import { useLikes } from "@/lib/coverly/use-likes";
import type { LayoutMode } from "./view-controls";

const cap = (s: string) =>
  s.replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase());
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const SCROLL_MARGIN = 12;
const CARD_TRANSITION = `left .34s ${EASE}, top .34s ${EASE}, width .34s ${EASE}, height .34s ${EASE}, transform .16s, box-shadow .16s`;

export function CoverGrid({
  initialCovers,
  total,
  filters,
  mode,
  size,
  columns,
}: {
  initialCovers: CoverCardType[];
  total: number;
  filters: CoverFilters;
  mode: LayoutMode;
  size: number;
  columns?: number | null;
}) {
  const [covers, setCovers] = useState(initialCovers);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<{
    id: string;
    data: CoverDetailData | null;
  } | null>(null);
  const [similar, setSimilar] = useState<{
    id: string;
    data: CoverCardType[];
  } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const arRef = useRef<Map<string, number>>(new Map());
  const animateRef = useRef(false);
  const prevLenRef = useRef(0);
  const router = useRouter();
  const hasMore = covers.length < total;
  const { isLiked, toggle } = useLikes();

  useEffect(() => {
    const r = requestAnimationFrame(() => {
      animateRef.current = true;
    });
    return () => cancelAnimationFrame(r);
  }, []);

  useEffect(() => {
    if (!expandedId) return;
    let live = true;
    fetchCoverDetail(expandedId).then((d) => {
      if (live) setDetail({ id: expandedId, data: d });
    });
    fetchSimilarCovers(expandedId).then((rows) => {
      if (live) setSimilar({ id: expandedId, data: rows });
    });
    return () => {
      live = false;
    };
  }, [expandedId]);

  const activeDetail = detail && detail.id === expandedId ? detail.data : null;
  const activeSimilar =
    similar && similar.id === expandedId ? similar.data : null;

  const relayout = useCallback(() => {
    const cont = containerRef.current;
    if (!cont) return;
    const W = cont.clientWidth;
    if (!W) return;
    const nodes = Array.from(
      cont.querySelectorAll<HTMLElement>("[data-card-id]"),
    );
    const appended = covers.length !== prevLenRef.current;
    prevLenRef.current = covers.length;
    const useAnim = animateRef.current && !appended;
    const colW = Math.max(110, size);

    const panelH =
      expandedId && detailRef.current ? detailRef.current.offsetHeight + 8 : 0;
    const expIdx = expandedId
      ? covers.findIndex((c) => c.id === expandedId)
      : -1;

    const place = (
      node: HTMLElement,
      x: number,
      y: number,
      w: number,
      h: number,
    ) => {
      node.style.position = "absolute";
      node.style.left = `${x}px`;
      node.style.top = `${y}px`;
      node.style.width = `${w}px`;
      node.style.height = `${h}px`;
      node.style.transition = useAnim ? CARD_TRANSITION : "none";
    };

    let containerH = 0;
    let detailTop: number | null = null;

    if (mode === "bookshelf") {
      const H = Math.max(190, size * 1.9);
      const REF_CM = 24.5;
      const ROW_GAP = 14;
      const SHELF = 10;
      const SHELF_GAP = 42;
      const rows: { node: HTMLElement; w: number; h: number }[][] = [];
      let row: { node: HTMLElement; w: number; h: number }[] = [];
      let rw = 0;
      for (const node of nodes) {
        const ar = arRef.current.get(node.dataset.cardId ?? "") ?? 2 / 3;
        const hcm = Number(node.dataset.hcm) || 21;
        const h = H * Math.min(1.04, hcm / REF_CM);
        const w = h * ar;
        if (row.length && rw + w > W) {
          rows.push(row);
          row = [];
          rw = 0;
        }
        row.push({ node, w, h });
        rw += w + ROW_GAP;
      }
      if (row.length) rows.push(row);
      const expRow = expandedId
        ? rows.findIndex((r) =>
            r.some((o) => o.node.dataset.cardId === expandedId),
          )
        : -1;
      let y = 0;
      rows.forEach((r, ri) => {
        let x = 0;
        for (const o of r) {
          place(o.node, x, y + (H - o.h), o.w, o.h);
          x += o.w + ROW_GAP;
        }
        const shelfBottom = y + H + SHELF;
        if (ri === expRow) {
          detailTop = shelfBottom + 8;
          y = detailTop + panelH + SHELF_GAP;
        } else {
          y = shelfBottom + SHELF_GAP;
        }
      });
      containerH = Math.max(0, y - SHELF_GAP + 4);
    } else {
      const GRID_GAP = 10;
      const cols =
        columns && columns > 0
          ? columns
          : Math.max(1, Math.floor((W + GRID_GAP) / (colW + GRID_GAP)));
      const realW = (W - GRID_GAP * (cols - 1)) / cols;
      const h = realW * 1.5;
      const expRow = expIdx >= 0 ? Math.floor(expIdx / cols) : -1;
      const extra = expRow >= 0 ? panelH + GRID_GAP : 0;
      let maxBottom = 0;
      nodes.forEach((node, i) => {
        const row = Math.floor(i / cols);
        const col = i % cols;
        let y = row * (h + GRID_GAP);
        if (expRow >= 0 && row > expRow) y += extra;
        place(node, col * (realW + GRID_GAP), y, realW, h);
        maxBottom = Math.max(maxBottom, y + h);
      });
      if (expRow >= 0) detailTop = expRow * (h + GRID_GAP) + h + GRID_GAP;
      containerH = maxBottom;
    }

    if (expandedId && detailTop != null) {
      containerH = Math.max(containerH, detailTop + panelH);
    }

    cont.style.height = `${containerH}px`;
    cont.classList.remove("invisible");
    if (expandedId && detailRef.current && detailTop != null) {
      detailRef.current.style.top = `${detailTop}px`;
      detailRef.current.style.transition = useAnim
        ? `top .34s ${EASE}`
        : "none";
    }
  }, [covers, expandedId, mode, size, columns]);

  useLayoutEffect(() => {
    relayout();
  }, [relayout, activeDetail]);

  useEffect(() => {
    const cont = containerRef.current;
    if (!cont) return;
    const safety = setTimeout(() => cont.classList.remove("invisible"), 800);
    return () => clearTimeout(safety);
  }, []);

  useEffect(() => {
    const el = detailRef.current;
    if (!expandedId || !el || typeof ResizeObserver === "undefined") return;
    let lastHeight = -1;
    let raf = 0;
    const observer = new ResizeObserver(() => {
      const height = el.offsetHeight;
      if (height === lastHeight) return;
      lastHeight = height;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(relayout);
    });
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [expandedId, relayout]);

  useEffect(() => {
    if (!expandedId) return;
    const raf = requestAnimationFrame(() => {
      const card = containerRef.current?.querySelector<HTMLElement>(
        `[data-card-id="${expandedId}"]`,
      );
      if (!card) return;
      const body = document.body;
      const bodyScrolls =
        getComputedStyle(body).overflowY !== "visible" &&
        body.scrollHeight > body.clientHeight + 2;
      const target = (
        bodyScrolls
          ? body
          : document.scrollingElement || document.documentElement
      ) as HTMLElement;
      const headerH =
        parseFloat(
          getComputedStyle(document.documentElement).getPropertyValue(
            "--coverly-header-h",
          ),
        ) || 0;
      const cont = containerRef.current;
      const settled = parseFloat(card.style.top);
      const cardTop =
        cont && Number.isFinite(settled)
          ? cont.getBoundingClientRect().top + settled
          : card.getBoundingClientRect().top;
      const delta = cardTop - headerH - SCROLL_MARGIN;
      if (Math.abs(delta) < 8) return;
      target.scrollTo({
        top: Math.max(0, target.scrollTop + delta),
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
      });
    });
    return () => cancelAnimationFrame(raf);
  }, [expandedId]);

  useEffect(() => {
    let raf = 0;
    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(relayout);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
    };
  }, [relayout]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    let lastWidth = el.clientWidth;
    let raf = 0;
    const observer = new ResizeObserver(() => {
      const width = el.clientWidth;
      if (width === lastWidth) return;
      lastWidth = width;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(relayout);
    });
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [relayout]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;
    const observer = new IntersectionObserver(async ([entry]) => {
      if (!entry.isIntersecting || loading) return;
      setLoading(true);
      try {
        const next = await loadMoreCovers(filters, page + 1);
        setCovers((prev) => {
          const seen = new Set(prev.map((c) => c.id));
          return [...prev, ...next.covers.filter((c) => !seen.has(c.id))];
        });
        setPage((p) => p + 1);
      } finally {
        setLoading(false);
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [filters, page, loading, hasMore]);

  if (covers.length === 0) {
    return (
      <p className="py-20 text-center text-sm text-muted-foreground">
        No covers match these filters.
      </p>
    );
  }

  const openSimilar = (id: string) => {
    if (covers.some((c) => c.id === id)) {
      setExpandedId(id);
    } else {
      router.push(`/coverly/covers/${id}`);
    }
  };

  const expandedCover = expandedId
    ? covers.find((c) => c.id === expandedId)
    : null;

  const replayFlight = () => {
    const root = containerRef.current;
    if (!root) return;
    const imgs = Array.from(root.querySelectorAll<HTMLImageElement>("img"));
    const visible = imgs.find((img) => {
      const r = img.getBoundingClientRect();
      return (
        r.width > 0 &&
        r.height > 0 &&
        r.bottom > 0 &&
        r.top < window.innerHeight
      );
    });
    flyToBoard(visible ?? imgs[0] ?? null);
  };

  return (
    <>
      {process.env.NODE_ENV !== "production" && (
        <>
          <TunerPanel
            tuner={dockTuner}
            title={DOCK_TITLE}
            fields={DOCK_FIELDS}
            pill="Dock"
            offset={20}
          />
          <TunerPanel
            tuner={flyTuner}
            title={FLY_TITLE}
            fields={FLY_FIELDS}
            pill="Flight"
            offset={68}
            action={{ label: "Replay flight", run: replayFlight }}
          />
        </>
      )}
      <div ref={containerRef} className="invisible relative">
        {covers.map((cover) => (
          <BrowseCard
            key={cover.id}
            cover={cover}
            selected={cover.id === expandedId}
            stand={mode === "bookshelf"}
            onOpen={() =>
              setExpandedId((cur) => (cur === cover.id ? null : cover.id))
            }
            onAspect={(ar) => {
              arRef.current.set(cover.id, ar);
              if (mode === "bookshelf") relayout();
            }}
            liked={isLiked(cover.id)}
            onLike={() => toggle(cover.id)}
          />
        ))}
        {expandedCover && (
          <div ref={detailRef} className="absolute left-0 w-full">
            <DetailPanel
              cover={expandedCover}
              detail={activeDetail}
              similar={activeSimilar}
              onClose={() => setExpandedId(null)}
              onSimilar={openSimilar}
              onLayout={relayout}
            />
          </div>
        )}
      </div>
      {hasMore && (
        <div
          ref={sentinelRef}
          className="flex items-center justify-center py-4 text-xs text-muted-foreground"
        >
          {loading
            ? "Loading more covers…"
            : `${(total - covers.length).toLocaleString()} more covers`}
        </div>
      )}
      <p className="sr-only" aria-live="polite">
        Showing {covers.length} of {total} covers (page size {PAGE_SIZE})
      </p>
    </>
  );
}

function BrowseCard({
  cover,
  selected,
  stand,
  onOpen,
  onAspect,
  liked,
  onLike,
}: {
  cover: CoverCardType;
  selected: boolean;
  stand: boolean;
  onOpen: () => void;
  onAspect: (ar: number) => void;
  liked: boolean;
  onLike: () => void;
}) {
  const imgRef = useRef<HTMLImageElement>(null);
  return (
    <div
      data-card-id={cover.id}
      data-hcm={cover.height_cm ?? ""}
      className="group/card"
    >
      <button
        onClick={onOpen}
        aria-expanded={selected}
        className="block h-full w-full text-left"
      >
        <div
          className={`relative h-full overflow-hidden border bg-card transition-shadow group-hover/card:shadow-md ${
            stand
              ? "rounded-[4px] shadow-[0_5px_9px_rgba(0,0,0,0.4)]"
              : "rounded-lg shadow-sm"
          } ${
            selected
              ? "ring-2 ring-foreground ring-offset-2 ring-offset-background"
              : "border-border/70"
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgRef}
            src={cover.image_url}
            alt={`Cover of ${cover.title}${cover.author ? ` by ${cover.author}` : ""}`}
            loading="lazy"
            onLoad={(e) => {
              const el = e.currentTarget;
              if (el.naturalWidth) onAspect(el.naturalWidth / el.naturalHeight);
            }}
            className="h-full w-full bg-muted object-cover"
          />
          <div className="pointer-events-none absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/85 via-black/35 to-transparent p-2.5 opacity-0 transition-opacity duration-200 group-hover/card:opacity-100">
            <p className="line-clamp-2 text-[13px] font-medium leading-tight text-white">
              {cover.title}
            </p>
            <p className="mt-0.5 truncate text-[11px] text-white/75">
              {cover.author ?? "Unknown"}
              {cover.year ? ` · ${cover.year}` : ""}
            </p>
          </div>
        </div>
      </button>
      <div className="absolute left-2 top-2 z-10 flex gap-1 opacity-0 transition-opacity group-hover/card:opacity-100">
        <HeartButton liked={liked} onToggle={onLike} />
      </div>
      <AddToBoard
        coverId={cover.id}
        variant="icon"
        flyFrom={() => imgRef.current}
      />
    </div>
  );
}

const TAGS: [keyof CoverDetailData, string][] = [
  ["sub_genre", "Sub-genre"],
  ["art_style", "Art style"],
  ["typography", "Typography"],
  ["people", "People"],
  ["layout", "Layout"],
];

export function DetailPanel({
  cover,
  detail,
  similar,
  onClose,
  onSimilar,
  onLayout,
}: {
  cover: CoverCardType;
  detail: CoverDetailData | null;
  similar: CoverCardType[] | null;
  onClose: () => void;
  onSimilar: (id: string) => void;
  onLayout: () => void;
}) {
  const [shown, setShown] = useState(false);
  const bigRef = useRef<HTMLImageElement>(null);
  const dock = useDockConfig();
  const { isLiked, toggle } = useLikes();
  const liked = isLiked(cover.id);
  const [justLiked, setJustLiked] = useState(false);
  const likeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onLike = () => {
    toggle(cover.id);
    if (liked) return;
    if (likeTimer.current) clearTimeout(likeTimer.current);
    setJustLiked(true);
    likeTimer.current = setTimeout(() => setJustLiked(false), 1000);
  };
  const skeletonRow = rowMetrics(dock.peak, dock.height, dock.anchor);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const tone = detail?.palette
    ? detail.palette.is_dark
      ? "dark"
      : "light"
    : null;

  return (
    <div
      className="relative mt-1 flex flex-col gap-5 rounded-2xl border bg-card p-5 shadow-sm transition-all duration-300 sm:flex-row sm:gap-6"
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "none" : "translateY(-6px)",
      }}
    >
      <Link
        href={`/coverly/covers/${cover.id}`}
        aria-label="Open full page"
        title="Open full page"
        className="absolute right-11 top-3 flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <ArrowUpRight className="h-4 w-4" strokeWidth={2} />
      </Link>
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="w-28 shrink-0 sm:w-44">
        <Link
          href={`/coverly/covers/${cover.id}`}
          aria-label={`Open full page for ${cover.title}`}
          className="block"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={bigRef}
            src={cover.image_url}
            alt={cover.title}
            className="aspect-[2/3] w-full rounded-lg object-cover shadow-md outline outline-2 outline-offset-2 outline-transparent transition-[outline-color,box-shadow] duration-200 hover:shadow-lg hover:outline-foreground/25"
          />
        </Link>
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="pr-20 text-xl font-semibold leading-tight">
          <Link
            href={`/coverly/covers/${cover.id}`}
            className="underline decoration-transparent underline-offset-4 transition-colors duration-200 hover:decoration-foreground/40"
          >
            {cover.title}
          </Link>
        </h3>
        <p className="mt-1.5 font-medium leading-snug">
          {cover.author ?? "Unknown author"}
        </p>
        {(cover.year || cover.imprint) && (
          <p className="mt-1 text-sm leading-snug text-muted-foreground">
            {cover.year && (
              <span className="font-mono tabular-nums">{cover.year}</span>
            )}
            {cover.year && cover.imprint ? " · " : ""}
            {cover.imprint}
          </p>
        )}

        {detail ? (
          <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
            {TAGS.map(([key, label]) =>
              detail[key] ? (
                <div key={key}>
                  <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    {label}
                  </dt>
                  <dd className="mt-0.5 text-sm font-medium">
                    {cap(String(detail[key]))}
                  </dd>
                </div>
              ) : null,
            )}
            {tone && (
              <div>
                <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Tone
                </dt>
                <dd className="mt-0.5 text-sm font-medium">{cap(tone)}</dd>
              </div>
            )}
          </dl>
        ) : (
          <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i}>
                <div className="h-2.5 w-14 animate-pulse rounded bg-muted" />
                <div className="mt-1.5 h-4 w-20 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </dl>
        )}

        <div className="mt-3 flex gap-1.5">
          {detail
            ? (detail.palette?.colors ?? []).map((hex) => (
                <span
                  key={hex}
                  title={hex}
                  className="h-6 w-6 rounded-md border border-black/10"
                  style={{ backgroundColor: hex }}
                />
              ))
            : Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className="h-6 w-6 animate-pulse rounded-md bg-muted"
                />
              ))}
        </div>

        <LayoutGroup>
          <div className="mt-4 flex items-center gap-2">
            <AddToBoard
              coverId={cover.id}
              variant="button"
              flyFrom={() => bigRef.current}
            />
            <motion.div
              layout
              transition={{
                type: "spring",
                stiffness: 420,
                damping: 36,
                mass: 0.8,
              }}
            >
              <button
                onClick={onLike}
                aria-pressed={liked}
                className="flex items-center gap-2 rounded-[0.625rem] border px-4 py-2 text-sm hover:bg-muted/60"
              >
                <Heart
                  className={`h-4 w-4 ${liked ? "fill-red-500 text-red-500" : "text-muted-foreground"} ${
                    justLiked && liked ? "animate-heart-pulse" : ""
                  }`}
                  strokeWidth={2}
                />
                {liked ? "Liked" : "Like"}
              </button>
            </motion.div>
          </div>
        </LayoutGroup>

        {similar === null && (
          <div className="mt-5">
            <p className="relative z-10 mb-2 text-xs uppercase tracking-wide text-muted-foreground">
              Similar covers
            </p>
            <div
              style={{
                paddingTop: skeletonRow.top,
                paddingBottom: skeletonRow.bottom,
                minHeight: skeletonRow.total,
                gap: dock.gap,
              }}
              className="flex items-end overflow-x-auto"
            >
              {Array.from({ length: 12 }).map((_, i) => (
                <span
                  key={i}
                  style={{
                    height: dock.height,
                    width: Math.round(dock.height * 0.66),
                  }}
                  className="shrink-0 animate-pulse rounded bg-muted"
                />
              ))}
            </div>
          </div>
        )}

        {similar !== null && similar.length > 0 && (
          <div className="mt-5">
            <p className="relative z-10 mb-2 text-xs uppercase tracking-wide text-muted-foreground">
              Similar covers
            </p>
            <SimilarCovers
              covers={similar}
              onOpen={onSimilar}
              onLoad={onLayout}
            />
          </div>
        )}
      </div>
    </div>
  );
}
