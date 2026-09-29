"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { describeElement } from "@/lib/design/catalog";
import { findElement } from "@/lib/design/ops";
import { modeOf, type PointerTarget } from "@/lib/design/types";
import { cn } from "@/lib/utils";
import { selectTarget, useEditor } from "@/stores/editor";
import { useVoice } from "@/stores/voice";
import { DesignRenderer } from "./design-renderer";
import { HeroRenderer } from "./hero-renderer";
import { VoiceSetup } from "./voice-setup";

type Box = { top: number; left: number; width: number; height: number };

export function Canvas() {
  const committed = useEditor((s) => s.committed);
  const preview = useEditor((s) => s.preview);
  const flash = useEditor((s) => s.flash);
  const pointerMode = useEditor((s) => s.pointerMode);
  const locked = useEditor((s) => s.locked);
  const target = useEditor(selectTarget);
  const setHover = useEditor((s) => s.setHover);
  const lockOn = useEditor((s) => s.lockOn);
  const clearTarget = useEditor((s) => s.clearTarget);

  const design =
    preview?.status === "applied" && !preview.command
      ? preview.design
      : committed;
  const previewIds = preview?.status === "applied" ? preview.changed : [];
  const empty = design.elements.length === 0;
  const setupOpen = useVoice((s) => s.setupOpen);

  const containerRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<Box | null>(null);

  const measure = useCallback(() => {
    const container = containerRef.current;
    if (!container || !target || !pointerMode) return setBox(null);
    const node =
      target.type === "element"
        ? container.querySelector<HTMLElement>(`[data-el-id="${target.id}"]`)
        : container.querySelector<HTMLElement>("[data-card]");
    if (!node) return setBox(null);
    const c = container.getBoundingClientRect();
    const r = node.getBoundingClientRect();
    const pad = target.type === "element" ? 5 : 8;
    setBox({
      top: r.top - c.top + container.scrollTop - pad,
      left: r.left - c.left + container.scrollLeft - pad,
      width: r.width + pad * 2,
      height: r.height + pad * 2,
    });
  }, [target, pointerMode]);

  useLayoutEffect(() => {
    measure();
    let frames = 0;
    let raf = 0;
    const tick = () => {
      measure();
      if (++frames < 24) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [measure, design]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver(measure);
    ro.observe(container);
    return () => ro.disconnect();
  }, [measure]);

  const targetFromEvent = (
    e: React.PointerEvent | React.MouseEvent,
  ): PointerTarget | null => {
    const node = (e.target as HTMLElement).closest<HTMLElement>(
      "[data-el-id],[data-card]",
    );
    if (!node) return null;
    return node.dataset.elId
      ? { type: "element", id: node.dataset.elId }
      : { type: "card" };
  };

  const targetEl =
    target?.type === "element" ? findElement(design, target.id) : null;
  const tag =
    target?.type === "card"
      ? design.name
      : targetEl
        ? describeElement(targetEl)
        : null;

  return (
    <div
      ref={containerRef}
      className={cn(
        "canvas-ground relative flex min-h-0 flex-1 items-center justify-center overflow-auto px-6 pt-10 pb-56 *:relative *:z-[1]",
        pointerMode && "cursor-crosshair",
      )}
      onPointerMove={(e) => {
        if (!pointerMode || locked) return;
        const t = targetFromEvent(e);
        if (t) setHover(t);
      }}
      onClick={(e) => {
        if (!pointerMode) return;
        const t = targetFromEvent(e);
        if (t) lockOn(t);
        else clearTarget();
      }}
    >
      {empty && !preview ? null : modeOf(design) === "hero" ? (
        <HeroRenderer
          design={design}
          flashIds={flash.ids}
          flashKey={flash.key}
          previewIds={previewIds}
        />
      ) : (
        <DesignRenderer
          design={design}
          flashIds={flash.ids}
          flashKey={flash.key}
          previewIds={previewIds}
        />
      )}

      {setupOpen && (
        <div
          className="absolute! inset-0 z-20! flex items-center justify-center bg-paper/45 px-6 pb-40 backdrop-blur-[3px]"
          onClick={(e) => e.stopPropagation()}
        >
          <VoiceSetup floating />
        </div>
      )}

      {box && tag && (
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute! z-10! rounded-[10px] border-[1.5px] border-ink transition-[top,left,width,height] duration-100 ease-out",
            locked ? "bg-ink/[0.03]" : "border-dashed border-ink/70",
          )}
          style={box}
        >
          <div className="absolute -top-[27px] left-[-1.5px] flex items-center overflow-hidden rounded-full bg-ink text-[11px] leading-none font-medium whitespace-nowrap text-paper shadow-[0_4px_12px_rgb(20_18_14/0.18)]">
            <span className="max-w-64 truncate py-1.5 pr-2 pl-2.5">{tag}</span>

            <span className="border-l border-paper/20 py-1.5 pr-2.5 pl-2 text-paper/65">
              {locked ? "Locked" : "Click to target"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
