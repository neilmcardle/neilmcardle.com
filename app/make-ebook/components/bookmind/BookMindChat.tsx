"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { BookMindAction, useBookMind } from "../../hooks/useBookMind";
import type { Chapter } from "../../types";
import ReadingView from "./ReadingView";
import AssistantTurn from "./AssistantTurn";
import PendingRow from "./PendingRow";
import ChatEmptyState from "./ChatEmptyState";
import ChatComposer from "./ChatComposer";
import { matchCommands } from "./chatShared";
import { addRule } from "../../utils/bookmindMemory";
import {
  clearTrialUsed,
  hasUsedTrial,
  markTrialUsed,
} from "../../utils/bookMindTrial";
import styles from "../../styles/studio.module.css";
import { bookMindGate } from "../../state/bookMindGate";

type Mind = ReturnType<typeof useBookMind>;

interface BookMindChatProps {
  mind: Mind;
  bookId?: string;
  userId?: string;
  title?: string;
  chapters: Chapter[];
  selectedChapterIndex: number;
  selectedText?: string;
  onNavigateToChapter?: (chapterIndex: number) => void;
  onPreflight?: () => void;
  isPro: boolean;
  tierKnown?: boolean;
  onUpgrade?: () => void;
}

export default function BookMindChat({
  mind,
  bookId,
  userId,
  title,
  chapters,
  selectedChapterIndex,
  selectedText,
  onNavigateToChapter,
  onPreflight,
  isPro,
  tierKnown = true,
  onUpgrade,
}: BookMindChatProps) {
  const { messages, isLoading, isStreaming, activity, sendMessage, stop } =
    mind;

  const [input, setInput] = useState("");
  const [deep, setDeep] = useState(false);
  const [attached, setAttached] = useState<string[]>([]);
  const [dismissedSelection, setDismissedSelection] = useState<string | null>(
    null,
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const [slashIndex, setSlashIndex] = useState(0);
  const [reading, setReading] = useState<string | null>(null);
  const [trialUsed, setTrialUsed] = useState(() => hasUsedTrial(userId));

  const threadRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const pinned = useRef(true);

  const busy = isLoading || isStreaming;
  const trialMode = tierKnown && !isPro;
  const locked = trialMode && trialUsed;
  const selection =
    selectedText && selectedText !== dismissedSelection
      ? selectedText.trim()
      : "";

  useEffect(() => {
    setTrialUsed(hasUsedTrial(userId));
  }, [userId]);

  useEffect(() => {
    if (!trialMode || !mind.error) return;
    if (mind.errorCode === "free_question_spent") {
      markTrialUsed(userId);
      setTrialUsed(true);
    } else {
      clearTrialUsed(userId);
      setTrialUsed(false);
    }
  }, [mind.error, mind.errorCode, trialMode, userId]);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 200);
    return () => clearTimeout(t);
  }, []);

  useLayoutEffect(() => {
    const el = threadRef.current;
    if (el && pinned.current) el.scrollTop = el.scrollHeight;
  }, [messages, activity]);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [menuOpen]);

  const resize = () => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  };

  const opts = () => ({
    selectedChapterIndex,
    selectedText: selection || undefined,
    deep: deep || undefined,
    chapterIds: attached.length ? attached : undefined,
  });

  const afterSend = () => {
    pinned.current = true;
    setAttached([]);
    if (selection) setDismissedSelection(selectedText ?? null);
    if (trialMode) {
      markTrialUsed(userId);
      setTrialUsed(true);
    }
  };

  const guard = () => {
    const gate = bookMindGate({
      tierKnown,
      isPro,
      trialUsed,
      busy,
      hasChapters: chapters.length > 0,
    });
    if (gate === "upgrade") onUpgrade?.();
    return gate === "send";
  };

  const send = (text: string) => {
    const msg = text.trim();
    if (!msg || !guard()) return;
    setInput("");
    requestAnimationFrame(resize);
    const o = opts();
    afterSend();
    void sendMessage(msg, { ...o, action: "ask-question" });
  };

  const runAction = (action: BookMindAction, label: string) => {
    if (!guard()) return;
    setInput("");
    setMenuOpen(false);
    requestAnimationFrame(resize);
    const o = opts();
    afterSend();
    void sendMessage(label, { ...o, action });
  };

  const retry = (assistantId: string) => {
    if (!guard()) return;
    const idx = messages.findIndex((m) => m.id === assistantId);
    const user = [...messages.slice(0, idx)]
      .reverse()
      .find((m) => m.role === "user");
    if (!user) return;
    void sendMessage(user.content, {
      selectedChapterIndex,
      action: user.action ?? "ask-question",
      replaceFrom: user.id,
    });
  };

  const remember = (note: string) => {
    if (!bookId || !userId) return;
    addRule(userId, bookId, note);
  };

  const navigate = (index: number) => {
    if (index >= 0) onNavigateToChapter?.(index);
  };

  const slashMatches = matchCommands(input, isPro);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (slashMatches.length > 0) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const delta = e.key === "ArrowDown" ? 1 : -1;
        setSlashIndex(
          (i) => (i + delta + slashMatches.length) % slashMatches.length,
        );
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        const pick =
          slashMatches[Math.min(slashIndex, slashMatches.length - 1)];
        runAction(pick.action, pick.label);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setInput("");
        return;
      }
    }
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send(input);
    }
  };

  const visible = messages.filter(
    (m) => m.role !== "system" && (m.role === "user" || m.content.trim()),
  );
  const lastAssistantId = [...visible]
    .reverse()
    .find((m) => m.role === "assistant")?.id;
  const empty = visible.length === 0 && !activity;
  const canSend = input.trim().length > 0 && chapters.length > 0 && !busy;

  return (
    <div className={styles.bmChat}>
      <div
        ref={threadRef}
        className={styles.bmThread}
        onScroll={(e) => {
          const el = e.currentTarget;
          pinned.current =
            el.scrollHeight - el.scrollTop - el.clientHeight < 48;
        }}
      >
        {empty ? (
          <ChatEmptyState
            title={title}
            chapters={chapters}
            selectedChapterIndex={selectedChapterIndex}
            isPro={isPro}
            trialMode={trialMode}
            locked={locked}
            onPreflight={onPreflight}
            onRunAction={runAction}
          />
        ) : (
          <div className={styles.bmThreadInner} aria-live="polite">
            {visible.map((m) =>
              m.role === "user" ? (
                <div key={m.id} className={styles.bmUser}>
                  <p>{m.content}</p>
                </div>
              ) : (
                <AssistantTurn
                  key={m.id}
                  message={m}
                  chapters={chapters}
                  streaming={isStreaming && m.id === lastAssistantId}
                  isLast={m.id === lastAssistantId}
                  busy={busy}
                  isPro={isPro}
                  canRemember={!!bookId && !!userId}
                  onNavigate={navigate}
                  onRetry={() => retry(m.id)}
                  onRead={() => setReading(m.content)}
                  onRemember={remember}
                />
              ),
            )}
            {activity && <PendingRow {...activity} />}
          </div>
        )}
      </div>

      {locked ? (
        <div className={styles.bmTrial}>
          <p>You have used your free question.</p>
          <button type="button" onClick={onUpgrade}>
            See Pro
          </button>
        </div>
      ) : (
        <ChatComposer
          chapters={chapters}
          selectedChapterIndex={selectedChapterIndex}
          selection={selection}
          selectedText={selectedText}
          attached={attached}
          setAttached={setAttached}
          setDismissedSelection={setDismissedSelection}
          input={input}
          inputRef={inputRef}
          menuRef={menuRef}
          onInputChange={(value) => {
            setInput(value);
            setSlashIndex(0);
            resize();
          }}
          onKeyDown={onKeyDown}
          slashMatches={slashMatches}
          slashIndex={slashIndex}
          setSlashIndex={setSlashIndex}
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
          isPro={isPro}
          deep={deep}
          setDeep={setDeep}
          busy={busy}
          canSend={canSend}
          onSend={() => send(input)}
          onStop={stop}
          onRunAction={runAction}
        />
      )}

      <ReadingView
        open={reading !== null}
        onOpenChange={(open) => !open && setReading(null)}
        content={reading ?? ""}
        bookTitle={title}
        chapters={chapters.map((c) => ({ id: c.id, title: c.title }))}
        onNavigate={navigate}
      />
    </div>
  );
}
