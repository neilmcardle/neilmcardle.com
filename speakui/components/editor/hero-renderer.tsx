"use client";

import { ChevronDown, ImageIcon } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { GlowField } from "@/components/editor/glow-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ACCENTS, DEFAULT_HERO } from "@/lib/design/catalog";
import { IconGlyph } from "@/lib/design/icons";
import type { Design, Element, HeroSlot } from "@/lib/design/types";
import { cn } from "@/lib/utils";

const HEIGHT = {
  compact: "min-h-[440px]",
  tall: "min-h-[600px]",
  full: "min-h-[720px]",
} as const;
const HEADLINE = { sm: "text-4xl", md: "text-5xl", lg: "text-6xl" } as const;
const BUTTON_SIZE = { sm: "sm", md: "default", lg: "lg" } as const;

type Props = {
  design: Design;
  flashIds?: string[];
  flashKey?: number;
  previewIds?: string[];
};

export function HeroRenderer({
  design,
  flashIds = [],
  flashKey = 0,
  previewIds = [],
}: Props) {
  const hero = design.hero ?? DEFAULT_HERO;
  const accent = ACCENTS[design.accent];
  const dark = hero.theme === "dark";
  const vars = {
    "--hero-accent": accent.primary,
    "--hero-intensity": String(0.2 + (hero.intensity - 1) * 0.2),
    "--primary": accent.primary,
    "--primary-foreground": accent.foreground,
    "--ring": accent.primary,
  } as CSSProperties;

  const inSlot = (slot: HeroSlot) =>
    design.elements.filter((e) => e.section === slot);
  const centered = hero.layout === "centered";
  const split = hero.layout === "split";

  const wrap = (el: Element, node: ReactNode, className?: string) => (
    <div
      key={flashIds.includes(el.id) ? `${el.id}-${flashKey}` : el.id}
      data-el-id={el.id}
      className={cn(
        "relative rounded-md [&_*]:pointer-events-none",
        flashIds.includes(el.id) && "animate-flash",
        previewIds.includes(el.id) &&
          "outline-[1.5px] outline-offset-4 outline-dashed outline-ochre/80",
        className,
      )}
    >
      {node}
    </div>
  );

  const render = (el: Element) =>
    wrap(
      el,
      <Part el={el} dark={dark} centered={centered} />,
      el.kind === "input" ? "w-full max-w-72" : undefined,
    );

  const main = inSlot("main");
  const actions = inSlot("actions");
  const proof = inSlot("proof");
  const media = inSlot("media");
  const bottom = inSlot("bottom");
  const dockIcons = bottom.filter((e) => e.kind === "icon");
  const otherBottom = bottom.filter((e) => e.kind !== "icon");

  const textColumn = (
    <div
      className={cn(
        "flex flex-col gap-7",
        centered ? "items-center text-center" : "items-start text-left",
        !split && "max-w-3xl",
        centered && "mx-auto",
      )}
    >
      {main.length > 0 && (
        <div
          className={cn(
            "flex flex-col gap-4",
            centered ? "items-center" : "items-start",
          )}
        >
          {main.map(render)}
        </div>
      )}
      {actions.length > 0 && (
        <div
          className={cn("flex flex-wrap gap-3", centered && "justify-center")}
        >
          {actions.map(render)}
        </div>
      )}
      {proof.length > 0 && (
        <div
          className={cn(
            "mt-4 flex flex-col gap-3",
            centered ? "items-center" : "items-start",
          )}
        >
          {proof.filter((e) => e.kind !== "brand").map(render)}
          <div
            className={cn(
              "flex flex-wrap items-center gap-x-8 gap-y-3",
              centered && "justify-center",
            )}
          >
            {proof.filter((e) => e.kind === "brand").map(render)}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div
      data-card
      style={vars}
      className={cn(
        "design-scope hero-stage relative flex w-[min(1100px,100%)] flex-col overflow-hidden rounded-[20px] font-sans shadow-[0_1px_2px_rgb(20_18_14/0.06),0_30px_70px_-30px_rgb(20_18_14/0.35)]",
        dark && "dark hero-dark",
        HEIGHT[hero.height],
      )}
    >
      {hero.background === "shader" ? (
        <GlowField
          className="absolute inset-0"
          theme={dark ? "dark" : "light"}
          fallbackClassName="hero-bg hero-bg-aurora"
        />
      ) : (
        <div
          className={cn(
            "hero-bg absolute inset-0",
            `hero-bg-${hero.background}`,
          )}
          aria-hidden
        />
      )}

      <nav className="relative z-[1] flex items-center justify-between gap-6 px-8 pt-7 pb-2">
        <div className="flex min-h-9 items-center gap-6">
          {inSlot("nav-left").map(render)}
        </div>
        <div className="flex min-h-9 items-center gap-6">
          {inSlot("nav-right").map(render)}
        </div>
      </nav>

      <div
        className={cn(
          "relative z-[1] flex flex-1 items-center px-12 py-14",
          split && "grid grid-cols-2 gap-12",
        )}
      >
        <div className={cn("w-full", !split && !centered && "max-w-3xl")}>
          {textColumn}
        </div>
        {media.length > 0 && (
          <div className={cn("w-full", !split && "hidden")}>
            {media.map(render)}
          </div>
        )}
      </div>
      {media.length > 0 && !split && (
        <div className="relative z-[1] px-12 pb-14">{media.map(render)}</div>
      )}

      {(dockIcons.length > 0 || otherBottom.length > 0) && (
        <div className="relative z-[1] flex flex-col items-center gap-4 pb-7">
          {otherBottom.map(render)}
          {dockIcons.length > 0 && (
            <div className="hero-dock flex items-center gap-1 rounded-[18px] p-1.5">
              {dockIcons.map(render)}
            </div>
          )}
        </div>
      )}

      {design.elements.length === 0 && (
        <div className="relative z-[1] m-auto px-8 text-center text-sm opacity-60">
          Empty hero. Describe what it should have.
        </div>
      )}
    </div>
  );
}

function Part({
  el,
  dark,
  centered,
}: {
  el: Element;
  dark: boolean;
  centered: boolean;
}) {
  const ink = dark ? "text-white" : "text-[#14120e]";
  switch (el.kind) {
    case "logo":
      return (
        <span
          className={cn(
            "flex items-center gap-2 text-[15px] font-semibold tracking-[-0.02em]",
            ink,
          )}
        >
          <span
            className="size-5 rounded-[6px] bg-[var(--hero-accent)]"
            aria-hidden
          />
          {el.text}
        </span>
      );
    case "link":
      return (
        <span className={cn("text-sm font-medium opacity-70", ink)}>
          {el.text}
        </span>
      );
    case "eyebrow":
      return (
        <span
          className={cn(
            "text-[11px] font-medium tracking-[0.14em] uppercase opacity-55",
            ink,
          )}
        >
          {el.text}
        </span>
      );
    case "badge":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium",
            dark
              ? "border-white/15 bg-white/5 text-white/85"
              : "border-black/10 bg-white/60 text-black/75",
          )}
        >
          <span
            className="size-1.5 rounded-full bg-[var(--hero-accent)]"
            aria-hidden
          />
          {el.text}
        </span>
      );
    case "headline":
      return (
        <h1
          className={cn(
            "leading-[1.04] font-medium tracking-[-0.035em] text-balance",
            HEADLINE[el.size ?? "lg"],
            ink,
          )}
        >
          {withEmphasis(el.text ?? "", el.emphasis)}
        </h1>
      );
    case "text":
      return (
        <p
          className={cn(
            "max-w-xl text-lg leading-relaxed text-pretty opacity-70",
            ink,
            centered && "mx-auto",
          )}
        >
          {el.text}
        </p>
      );
    case "avatar":
      return (
        <span
          className="grid size-[76px] place-items-center rounded-[20px] bg-[linear-gradient(135deg,var(--hero-accent),oklch(from_var(--hero-accent)_calc(l+0.15)_c_calc(h+50)))] text-xl font-semibold text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.35),0_10px_30px_-10px_var(--hero-accent)]"
          aria-label="Avatar placeholder"
        >
          {initials(el.text)}
        </span>
      );
    case "image":
      return (
        <div
          className={cn(
            "grid aspect-[16/10] w-full place-items-center rounded-2xl border",
            dark
              ? "border-white/12 bg-white/[0.04]"
              : "border-black/10 bg-white/60",
          )}
        >
          <span
            className={cn(
              "flex flex-col items-center gap-2 text-sm opacity-50",
              ink,
            )}
          >
            <ImageIcon className="size-6" />
            {el.text}
          </span>
        </div>
      );
    case "brand":
      return (
        <span
          className={cn(
            "text-[17px] font-semibold tracking-[-0.02em] opacity-50",
            ink,
          )}
        >
          {el.text}
        </span>
      );
    case "icon":
      return (
        <span
          className={cn(
            "grid size-10 place-items-center rounded-[12px]",
            dark ? "text-white/85" : "text-black/75",
          )}
        >
          <IconGlyph name={el.icon} className="size-[18px]" />
        </span>
      );
    case "scroll":
      return (
        <ChevronDown
          className={cn("size-6 animate-bounce opacity-50", ink)}
          aria-label="Scroll down"
        />
      );
    case "button":
      return (
        <Button
          tabIndex={-1}
          variant={el.variant ?? "default"}
          size={BUTTON_SIZE[el.size ?? "lg"]}
          className={cn("rounded-full px-5", el.fullWidth && "w-full")}
        >
          <IconGlyph name={el.icon} />
          {el.text}
        </Button>
      );
    case "input":
      return (
        <Input
          tabIndex={-1}
          readOnly
          placeholder={el.placeholder ?? el.label}
          className="h-10 rounded-full px-4"
        />
      );
    default:
      return <span className="text-xs opacity-60">{el.kind}</span>;
  }
}

function withEmphasis(text: string, word?: string): ReactNode {
  if (!word) return text;
  const i = text.toLowerCase().indexOf(word.toLowerCase());
  if (i < 0) return text;
  return (
    <>
      {text.slice(0, i)}
      <span className="border-b-2 border-dotted border-[var(--hero-accent)] pb-0.5">
        {text.slice(i, i + word.length)}
      </span>
      {text.slice(i + word.length)}
    </>
  );
}

function initials(name?: string): string {
  const parts = (name ?? "").split(/\s+/).filter(Boolean);
  return (
    parts
      .map((p) => p[0])
      .join("")
      .slice(0, 2) || "·"
  ).toUpperCase();
}
