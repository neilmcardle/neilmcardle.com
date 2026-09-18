"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "../styles/studio.module.css";

const LITERARY_QUOTES = [
  {
    text: "There is no greater agony than bearing an untold story inside you.",
    author: "Maya Angelou",
  },
  {
    text: "The scariest moment is always just before you start.",
    author: "Stephen King",
  },
  { text: "You can make anything by writing.", author: "C.S. Lewis" },
  {
    text: "Start writing, no matter what. The water does not flow until the faucet is turned on.",
    author: "Louis L'Amour",
  },
  {
    text: "If there's a book that you want to read, but it hasn't been written yet, then you must write it.",
    author: "Toni Morrison",
  },
  { text: "Write what should not be forgotten.", author: "Isabel Allende" },
  {
    text: "One day I will find the right words, and they will be simple.",
    author: "Jack Kerouac",
  },
  {
    text: "The first draft is just you telling yourself the story.",
    author: "Terry Pratchett",
  },
  {
    text: "Fill your paper with the breathings of your heart.",
    author: "William Wordsworth",
  },
  {
    text: "We write to taste life twice, in the moment and in retrospect.",
    author: "Anaïs Nin",
  },
];

const PATHS = {
  paste: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2",
  upload: "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12",
  write:
    "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
  library: "M4 4v16M10 7v13M16 5v15M3 20h18",
};

function Icon({ path, extra }: { path: string; extra?: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={path} />
      {extra}
    </svg>
  );
}

const ACTIONS = [
  {
    id: "paste",
    label: "Paste manuscript",
    description: "From a doc, an email, anywhere",
    icon: (
      <Icon
        path={PATHS.paste}
        extra={<rect x="9" y="3" width="6" height="4" rx="1" />}
      />
    ),
  },
  {
    id: "upload",
    label: "Upload a file",
    description: ".docx or .txt",
    icon: <Icon path={PATHS.upload} />,
  },
  {
    id: "write",
    label: "Start writing",
    description: "Begin with a blank book",
    icon: <Icon path={PATHS.write} />,
  },
  {
    id: "library",
    label: "Open library",
    description: "Your saved books",
    icon: <Icon path={PATHS.library} />,
  },
] as const;

interface EmptyEditorStateProps {
  onNewBook: () => void;
  onPasteManuscript: (text: string) => void;
  onUploadFile: () => void;
  onOpenLibrary: () => void;
}

export default function EmptyEditorState({
  onNewBook,
  onPasteManuscript,
  onUploadFile,
  onOpenLibrary,
}: EmptyEditorStateProps) {
  const [quote, setQuote] = useState(LITERARY_QUOTES[0]);
  const [pasting, setPasting] = useState(false);
  const [draft, setDraft] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pasteButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setQuote(
      LITERARY_QUOTES[Math.floor(Math.random() * LITERARY_QUOTES.length)],
    );
  }, []);

  useEffect(() => {
    if (pasting) textareaRef.current?.focus();
  }, [pasting]);

  const words = draft.trim() ? draft.trim().split(/\s+/).length : 0;

  const run = {
    paste: () => setPasting(true),
    upload: onUploadFile,
    write: onNewBook,
    library: onOpenLibrary,
  };

  const submit = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onPasteManuscript(trimmed);
    setDraft("");
    setPasting(false);
  };

  const cancel = () => {
    setDraft("");
    setPasting(false);
    pasteButtonRef.current?.focus();
  };

  return (
    <div className={styles.emptyStage}>
      <div className={styles.emptyPanel}>
        <h2 className={styles.emptyTitle}>Bring your book.</h2>
        <p className={styles.emptyLede}>
          However it got written, this is where it gets finished.
        </p>

        {pasting ? (
          <div>
            <textarea
              ref={textareaRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Paste your manuscript here"
              aria-label="Paste your manuscript"
              className={styles.pasteArea}
            />
            <div className={styles.pasteFoot}>
              <span>
                {draft.trim()
                  ? `${words.toLocaleString()} words`
                  : "Paste to begin"}
              </span>
              <span className={styles.pasteActions}>
                <button type="button" onClick={cancel} className={styles.quiet}>
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submit}
                  disabled={!draft.trim()}
                  className={styles.acid}
                >
                  Import
                </button>
              </span>
            </div>
          </div>
        ) : (
          <div className={styles.emptyRows}>
            {ACTIONS.map((action, i) => (
              <button
                key={action.id}
                ref={action.id === "paste" ? pasteButtonRef : undefined}
                type="button"
                onClick={run[action.id]}
                style={{ animationDelay: `${i * 70}ms` }}
                className={`${styles.emptyRow} ${
                  action.id === "paste" ? styles.emptyRowPrimary : ""
                }`}
              >
                <span className={styles.emptyIcon}>{action.icon}</span>
                <span className={styles.emptyText}>
                  <span className={styles.emptyLabel}>{action.label}</span>
                  <span className={styles.emptyDesc}>{action.description}</span>
                </span>
                <svg
                  className={styles.emptyChevron}
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </button>
            ))}
          </div>
        )}

        <p className={styles.emptyQuote}>
          &ldquo;{quote.text}&rdquo;{" "}
          <span className={styles.emptyQuoteAuthor}>— {quote.author}</span>
        </p>
      </div>
    </div>
  );
}
