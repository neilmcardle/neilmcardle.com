"use client";

import React from "react";
import type { FormatState } from "./formatState";
import {
  ALIGNS,
  CLEAR,
  HEADINGS,
  HISTORY,
  INDENTS,
  MARKS,
  insertItem,
  type ToolbarAction,
} from "./toolbarItems";

export type ToolbarProps = {
  formats: FormatState;
  disabled: boolean;
  canEndnote: boolean;
  onAction: (action: ToolbarAction) => void;
  progress?: number;
};

const keepFocus = (e: React.MouseEvent) => e.preventDefault();
const flat = { borderRadius: 0, boxShadow: "none" } as const;
const ACTIVE = "bg-[var(--paper)] text-[var(--ink-deep)]";
const ICON_BUTTON =
  "w-9 h-9 rounded-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-[var(--ink-raised)] active:scale-[0.96] transition touch-manipulation";

export function Separator() {
  return (
    <div className="w-px h-6 bg-gray-300 dark:bg-[var(--rule)] flex-shrink-0" />
  );
}

function Icon({
  src,
  size = "w-3.5 h-3.5",
  style,
}: {
  src: string;
  size?: string;
  style?: React.CSSProperties;
}) {
  return (
    <img
      src={src}
      alt=""
      aria-hidden="true"
      className={`${size} ${style ? "" : "dark:invert"}`.trim()}
      style={{ ...flat, ...style }}
    />
  );
}

export function Toolbar({
  formats,
  disabled,
  canEndnote,
  onAction,
  progress = 0,
}: ToolbarProps) {
  const endnote = insertItem("endnote");
  const link = insertItem("link");
  const anchor = insertItem("anchor");
  const image = insertItem("image");
  return (
    <div
      data-editor-toolbar
      className="flex items-center py-2 gap-2 overflow-x-auto overflow-y-visible scrollbar-hide"
    >
      <span
        data-editor-progress
        data-started={progress > 0 ? "" : undefined}
        aria-hidden="true"
      >
        <span style={{ transform: `scaleX(${progress})` }} />
      </span>
      <div className="flex items-center gap-2 flex-shrink-0">
        {HISTORY.map((item) => (
          <button
            key={item.title}
            onMouseDown={keepFocus}
            onClick={() => onAction(item.action)}
            title={item.title}
            aria-label={item.title}
            type="button"
            disabled={disabled}
            className={`${ICON_BUTTON} text-gray-700 dark:text-[var(--clay)]`}
          >
            <Icon src={item.icon} size="w-4 h-4" />
          </button>
        ))}
      </div>

      <Separator />

      <div className="flex items-center gap-2 flex-shrink-0">
        {MARKS.map((b) => (
          <button
            key={b.mark}
            onMouseDown={keepFocus}
            onClick={() => onAction({ type: "mark", mark: b.mark })}
            title={b.title}
            aria-label={b.title}
            aria-pressed={!!formats[b.mark]}
            type="button"
            disabled={disabled}
            className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold active:scale-[0.96] transition-transform touch-manipulation ${
              formats[b.mark] ? ACTIVE : "bg-transparent text-[var(--clay)]"
            } ${b.className || ""}`}
          >
            {b.label}
          </button>
        ))}
      </div>

      <Separator />

      <div
        role="group"
        aria-label="Paragraph style"
        className="flex items-center gap-2 flex-shrink-0 rounded-lg p-2"
      >
        {HEADINGS.map((h) => {
          const active = !!formats[`heading${h.level}`];
          return (
            <button
              key={h.level}
              onMouseDown={keepFocus}
              onClick={() => onAction({ type: "heading", level: h.level })}
              title={h.title}
              aria-label={h.title}
              aria-pressed={active}
              type="button"
              disabled={disabled}
              className={`w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold transition-colors touch-manipulation ${
                active
                  ? ACTIVE
                  : "text-gray-500 dark:text-[var(--clay-muted)] hover:text-gray-700 dark:hover:text-[var(--clay)]"
              }`}
            >
              {h.label}
            </button>
          );
        })}
      </div>

      <Separator />

      <div className="flex items-center gap-2 flex-shrink-0">
        {ALIGNS.map((a) => (
          <button
            key={a.align}
            onMouseDown={keepFocus}
            onClick={() => onAction({ type: "align", align: a.align })}
            title={a.title}
            aria-label={a.title}
            aria-pressed={!!formats[a.state]}
            type="button"
            disabled={disabled}
            className={`w-9 h-9 rounded-lg flex items-center justify-center active:scale-[0.96] transition-transform touch-manipulation ${
              formats[a.state] ? ACTIVE : "bg-transparent"
            }`}
          >
            <Icon
              src={a.icon}
              size="w-4 h-4"
              style={{ filter: formats[a.state] ? "invert(0)" : "invert(1)" }}
            />
          </button>
        ))}
      </div>

      <Separator />

      <div className="flex items-center gap-2 flex-shrink-0">
        {INDENTS.map((item) => (
          <button
            key={item.title}
            onMouseDown={keepFocus}
            onClick={() => onAction(item.action)}
            title={item.title}
            aria-label={item.title}
            type="button"
            disabled={disabled}
            className={`${ICON_BUTTON} text-gray-600 dark:text-[var(--clay)]`}
          >
            <svg
              className="w-3.5 h-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.6}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 6h18M9 12h12M9 18h12" />
              <path d={item.path} />
            </svg>
          </button>
        ))}
      </div>

      <Separator />

      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onMouseDown={keepFocus}
          onClick={() => onAction(endnote.action)}
          title={endnote.title}
          aria-label={endnote.title}
          type="button"
          disabled={disabled || !canEndnote}
          className="w-9 h-9 rounded-lg hover:bg-gray-100 dark:hover:bg-[var(--ink-raised)] flex items-center justify-center active:scale-[0.96] transition touch-manipulation disabled:opacity-50"
        >
          <Icon src={endnote.icon} />
        </button>
        {[link, anchor].map((item) => (
          <button
            key={item.title}
            onMouseDown={keepFocus}
            onClick={() => onAction(item.action)}
            title={item.title}
            aria-label={item.title}
            type="button"
            disabled={disabled}
            className="w-9 h-9 rounded-lg bg-transparent flex items-center justify-center active:scale-[0.96] transition-transform touch-manipulation"
          >
            <Icon src={item.icon} />
          </button>
        ))}
      </div>

      <Separator />

      {[
        { item: image, label: image.title },
        { item: CLEAR, label: CLEAR.label },
      ].map(({ item, label }) => (
        <button
          key={label}
          onMouseDown={keepFocus}
          onClick={() => onAction(item.action)}
          title={item.title}
          aria-label={label}
          type="button"
          disabled={disabled}
          className={`${ICON_BUTTON} flex-shrink-0`}
        >
          <Icon src={item.icon} />
        </button>
      ))}
    </div>
  );
}

export function CompactToolbar({
  formats,
  canEndnote,
  onAction,
  dark,
  showMore,
  onToggleMore,
  onDone,
}: ToolbarProps & {
  dark: boolean;
  showMore: boolean;
  onToggleMore: () => void;
  onDone: () => void;
}) {
  const link = insertItem("link");
  const plain =
    "w-9 h-9 rounded-lg bg-transparent flex items-center justify-center active:bg-gray-200 dark:active:bg-[var(--ink-hover)]";
  return (
    <div
      data-compact-toolbar
      className="lg:hidden fixed left-0 right-0 z-[200] bg-white dark:bg-[var(--ink)] border-t border-gray-200 dark:border-[var(--rule)]"
      style={{
        bottom: "var(--kb, 0px)",
        paddingBottom: "var(--kb-pad, env(safe-area-inset-bottom, 0px))",
      }}
    >
      {showMore && (
        <MoreMenu
          formats={formats}
          canEndnote={canEndnote}
          onAction={onAction}
          onClose={onToggleMore}
        />
      )}

      <div className="flex items-center px-6 py-2 gap-1 overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-2 flex-shrink-0">
          {HISTORY.map((item) => (
            <button
              key={item.title}
              onMouseDown={keepFocus}
              onClick={() => onAction(item.action)}
              className={plain}
              title={item.title}
            >
              <img
                src={item.icon}
                alt={item.title}
                className="w-4 h-4 dark:invert"
                style={flat}
              />
            </button>
          ))}
        </div>

        <Separator />

        <div className="flex items-center gap-2 flex-shrink-0">
          {MARKS.map((b) => (
            <button
              key={b.mark}
              onMouseDown={keepFocus}
              onClick={() => onAction({ type: "mark", mark: b.mark })}
              className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold active:scale-[0.96] transition-transform ${
                formats[b.mark] ? ACTIVE : "bg-transparent text-[var(--clay)]"
              } ${b.className || ""}`}
              title={b.title}
            >
              {b.label}
            </button>
          ))}
        </div>

        <Separator />

        <div className="flex items-center gap-2 flex-shrink-0">
          {HEADINGS.slice(0, 3).map((h) => (
            <button
              key={h.level}
              onMouseDown={keepFocus}
              onClick={() => onAction({ type: "heading", level: h.level })}
              className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold active:scale-[0.96] transition-transform ${
                formats[`heading${h.level}`]
                  ? ACTIVE
                  : "bg-transparent text-[var(--clay)]"
              }`}
              title={h.title}
            >
              {h.label}
            </button>
          ))}
        </div>

        <Separator />

        <div className="flex items-center gap-2 flex-shrink-0">
          {ALIGNS.map((a) => {
            const active = !!formats[a.state];
            return (
              <button
                key={a.align}
                onMouseDown={keepFocus}
                onClick={() => onAction({ type: "align", align: a.align })}
                className={`w-9 h-9 rounded-lg flex items-center justify-center active:scale-[0.96] transition-transform ${
                  active
                    ? "bg-[var(--ink-raised)] dark:bg-white"
                    : "bg-transparent"
                }`}
                title={a.title}
              >
                <img
                  src={a.icon}
                  alt={a.title}
                  className="w-3.5 h-3.5"
                  style={{
                    ...flat,
                    filter: active === dark ? "invert(0)" : "invert(1)",
                  }}
                />
              </button>
            );
          })}
        </div>

        <Separator />

        {[
          { item: link, alt: "Link" },
          { item: CLEAR, alt: "Clear" },
        ].map(({ item, alt }) => (
          <button
            key={alt}
            onMouseDown={keepFocus}
            onClick={() => onAction(item.action)}
            className={`${plain} flex-shrink-0`}
            title={item.title}
          >
            <img
              src={item.icon}
              alt={alt}
              className="w-3.5 h-3.5 dark:invert"
              style={flat}
            />
          </button>
        ))}

        <button
          onMouseDown={keepFocus}
          onClick={onToggleMore}
          className={`w-9 h-9 rounded-lg flex items-center justify-center active:scale-[0.96] transition-transform flex-shrink-0 ${
            showMore
              ? "bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400"
              : "bg-transparent text-[var(--clay)]"
          }`}
          title="More options"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="5" cy="12" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="19" cy="12" r="2" />
          </svg>
        </button>

        <Separator />

        <button
          onMouseDown={keepFocus}
          onClick={onDone}
          className="flex-shrink-0 px-3 h-9 rounded-lg bg-violet-600 text-white text-sm font-medium active:bg-violet-700"
        >
          Done
        </button>
      </div>
    </div>
  );
}

function MoreMenu({
  formats,
  canEndnote,
  onAction,
  onClose,
}: Pick<ToolbarProps, "formats" | "canEndnote" | "onAction"> & {
  onClose: () => void;
}) {
  const row =
    "flex items-center gap-2 px-3 py-2 rounded-lg bg-transparent text-sm font-medium text-gray-700 dark:text-[var(--clay)] active:bg-[var(--ink-raised)]";
  const choose = (action: ToolbarAction) => {
    onAction(action);
    onClose();
  };
  return (
    <div className="absolute bottom-full left-0 right-0 bg-white dark:bg-[var(--ink)] border-t border-gray-200 dark:border-[var(--rule)] shadow-lg p-3">
      <div className="flex flex-wrap gap-2">
        {(["endnote", "anchor", "image"] as const).map((type) => {
          const item = insertItem(type);
          return (
            <button
              key={type}
              onMouseDown={keepFocus}
              onClick={() => choose(item.action)}
              disabled={type === "endnote" && !canEndnote}
              className={`${row}${type === "endnote" ? " disabled:opacity-50" : ""}`}
            >
              <img
                src={item.icon}
                alt=""
                className="w-3.5 h-3.5 dark:invert"
                style={flat}
              />
              {item.label}
            </button>
          );
        })}
        <button
          onMouseDown={keepFocus}
          onClick={() => choose({ type: "heading", level: 3 })}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium active:bg-[var(--ink-raised)] ${
            formats.heading3 ? ACTIVE : "bg-transparent text-[var(--clay)]"
          }`}
        >
          H3
        </button>
      </div>
    </div>
  );
}
