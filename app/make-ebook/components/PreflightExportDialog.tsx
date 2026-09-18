"use client";

import React, { useEffect, useState } from "react";
import { track } from "@vercel/analytics";
import { Modal, ModalHeader } from "./Modal";
import {
  runPreflightChecks,
  PreflightInput,
  CheckResult,
} from "../utils/preflightChecks";
import { LANGUAGES } from "../utils/constants";
import styles from "../styles/studio.module.css";
import GenrePicker from "./GenrePicker";
import GenerateCoverModal from "./sidebar/GenerateCoverModal";

export type ExportFormat = "epub" | "pdf" | "docx";

export interface PreflightFixes {
  setTitle: (value: string) => void;
  setAuthor: (value: string) => void;
  setGenre: (value: string) => void;
  setLanguage: (value: string) => void;
  onCoverChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setCover: (dataUrl: string) => void;
  onShowChapters: () => void;
  onShowField: (field: BookField) => void;
}

export type BookField =
  "title" | "author" | "genre" | "language" | "cover-image";

interface PreflightExportDialogProps {
  open: boolean;
  format: ExportFormat;
  input: PreflightInput;
  isPro: boolean;
  fixes: PreflightFixes;
  onClose: () => void;
  onDownload: () => void;
  onUpgrade: () => void;
}

const FORMAT_LABEL: Record<ExportFormat, string> = {
  epub: "EPUB",
  pdf: "PDF",
  docx: "Word",
};

const ORDER: Record<CheckResult["status"], number> = {
  block: 0,
  warn: 1,
  pass: 2,
};

export default function PreflightExportDialog({
  open,
  format,
  input,
  isPro,
  fixes,
  onClose,
  onDownload,
  onUpgrade,
}: PreflightExportDialogProps) {
  const result = runPreflightChecks(input);
  const { blocks } = result;

  useEffect(() => {
    if (!open) return;
    track("preflight_viewed", {
      source: "export",
      tier: isPro ? "pro" : "free",
      format,
    });
    if (isPro && blocks.length > 0) {
      track("preflight_blocks_present", { format, blockCount: blocks.length });
    }
  }, [open, isPro, format, blocks.length]);

  if (!open || typeof document === "undefined") return null;

  const formatLabel = FORMAT_LABEL[format];

  return (
    <Modal
      open={open}
      onClose={onClose}
      width="md"
      label={`Export ${formatLabel}`}
    >
      <ModalHeader title={`Export ${formatLabel}`} onClose={onClose} />
      {isPro ? (
        <ProBody
          result={result}
          input={input}
          fixes={fixes}
          formatLabel={formatLabel}
          onDownload={onDownload}
          onClose={onClose}
        />
      ) : (
        <FreeBody
          formatLabel={formatLabel}
          onDownload={onDownload}
          onUpgrade={onUpgrade}
          onClose={onClose}
        />
      )}
    </Modal>
  );
}

function Fix({
  check,
  input,
  fixes,
  onClose,
}: {
  check: CheckResult;
  input: PreflightInput;
  fixes: PreflightFixes;
  onClose: () => void;
}) {
  const [generating, setGenerating] = useState(false);
  const [draft, setDraft] = useState(() => {
    if (check.id === "title") {
      const t = input.title?.trim() ?? "";
      return ["untitled", "pasted manuscript", "untitled book"].includes(
        t.toLowerCase(),
      )
        ? ""
        : t;
    }
    if (check.id === "author") return input.author ?? "";
    return "";
  });

  const field: BookField | null =
    check.id === "title" ||
    check.id === "author" ||
    check.id === "genre" ||
    check.id === "language"
      ? check.id
      : check.id === "cover"
        ? "cover-image"
        : null;
  const link = field ? (
    <button
      type="button"
      className={styles.fixLink}
      onClick={() => {
        onClose();
        fixes.onShowField(field);
      }}
    >
      Edit in Book details
    </button>
  ) : null;

  if (check.id === "genre") {
    return (
      <>
        <div className={styles.fixField}>
          <GenrePicker
            value={input.genre ?? ""}
            onChange={fixes.setGenre}
            className={styles.fixInput}
          />
        </div>
        {link}
      </>
    );
  }

  if (check.id === "title" || check.id === "author") {
    const setter = check.id === "title" ? fixes.setTitle : fixes.setAuthor;
    const placeholder =
      check.id === "title"
        ? "Your book's title"
        : "Name as it appears on the cover";
    return (
      <>
        <input
          className={styles.fixInput}
          value={draft}
          placeholder={placeholder}
          aria-label={check.label}
          onChange={(e) => {
            setDraft(e.target.value);
            setter(e.target.value);
          }}
        />
        {link}
      </>
    );
  }

  if (check.id === "language") {
    return (
      <>
        <select
          className={styles.fixInput}
          aria-label="Language"
          defaultValue=""
          onChange={(e) => fixes.setLanguage(e.target.value)}
        >
          <option value="" disabled>
            Choose a language
          </option>
          {LANGUAGES.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
        {link}
      </>
    );
  }

  if (check.id === "cover") {
    const ready = !!input.title?.trim() && !!input.author?.trim();
    return (
      <>
        <span className={styles.fixRow}>
          <button
            type="button"
            className={styles.fixButton}
            disabled={!ready}
            onClick={() => setGenerating(true)}
          >
            Generate a cover
          </button>
          <label className={styles.fixButton}>
            Upload an image
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={fixes.onCoverChange}
            />
          </label>
        </span>
        {!ready && (
          <p className={styles.fixNote}>
            Add a title and author first, and a cover can be made from them.
          </p>
        )}
        {link}
        <GenerateCoverModal
          open={generating}
          onClose={() => setGenerating(false)}
          title={input.title ?? ""}
          author={input.author ?? ""}
          genre={input.genre}
          onAccept={(dataUrl) => {
            fixes.setCover(dataUrl);
            setGenerating(false);
          }}
        />
      </>
    );
  }

  if (check.id === "chapter-uniformity" || check.id === "genre-word-count") {
    return (
      <button
        type="button"
        className={styles.fixButton}
        onClick={() => {
          onClose();
          fixes.onShowChapters();
        }}
      >
        Show chapters
      </button>
    );
  }

  if (check.id === "word-count") {
    return (
      <p className={styles.fixNote}>
        Nothing to fix here but more writing. Your draft is saved.
      </p>
    );
  }

  return null;
}

function ProBody({
  result,
  input,
  fixes,
  formatLabel,
  onDownload,
  onClose,
}: {
  result: ReturnType<typeof runPreflightChecks>;
  input: PreflightInput;
  fixes: PreflightFixes;
  formatLabel: string;
  onDownload: () => void;
  onClose: () => void;
}) {
  const { checks, blocks, warns } = result;
  const [openedWith] = useState(() => ({
    order: [...checks]
      .sort((a, b) => ORDER[a.status] - ORDER[b.status])
      .map((c) => c.id),
    issues: new Set(checks.filter((c) => c.status !== "pass").map((c) => c.id)),
  }));
  const rank = (id: string) => {
    const i = openedWith.order.indexOf(id);
    return i < 0 ? openedWith.order.length : i;
  };
  const sorted = [...checks].sort((a, b) => rank(a.id) - rank(b.id));
  const passed = checks.length - blocks.length - warns.length;

  const summary =
    blocks.length > 0
      ? `${blocks.length} ${blocks.length === 1 ? "issue" : "issues"} Amazon is likely to reject. Fix ${blocks.length === 1 ? "it" : "them"} here, or export anyway.`
      : warns.length > 0
        ? `Ready for KDP. ${warns.length} ${warns.length === 1 ? "suggestion" : "suggestions"} worth a look first.`
        : "Everything KDP checks for is in place.";

  return (
    <>
      <div className={styles.preflightBody}>
        <p className={styles.micro}>Amazon KDP pre-flight</p>
        <p className={styles.preflightSummary}>{summary}</p>

        <ul className={styles.checks}>
          {sorted.map((check) => (
            <li key={check.id} className={styles.preflightCheck}>
              <span
                className={`${styles.checkIcon} ${
                  check.status === "pass"
                    ? styles.ok
                    : check.status === "warn"
                      ? styles.warn
                      : styles.block
                }`}
                aria-label={
                  check.status === "pass"
                    ? "Passed"
                    : check.status === "warn"
                      ? "Suggestion"
                      : "Issue"
                }
              >
                {check.status === "pass" ? "✓" : "!"}
              </span>
              <span className={styles.preflightText}>
                <span className={styles.preflightLabel}>{check.label}</span>
                <span className={styles.checkSub}>{check.message}</span>
                {openedWith.issues.has(check.id) && (
                  <Fix
                    check={check}
                    input={input}
                    fixes={fixes}
                    onClose={onClose}
                  />
                )}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.paneFoot}>
        <span>
          {passed} of {checks.length} passed
        </span>
        <span className={styles.pasteActions}>
          <button type="button" className={styles.quiet} onClick={onClose}>
            Keep editing
          </button>
          <button
            type="button"
            className={blocks.length > 0 ? styles.btn : styles.acid}
            onClick={() => {
              onDownload();
              onClose();
            }}
          >
            {blocks.length > 0 ? "Export anyway" : `Export ${formatLabel}`}
          </button>
        </span>
      </div>
    </>
  );
}

function FreeBody({
  formatLabel,
  onDownload,
  onUpgrade,
  onClose,
}: {
  formatLabel: string;
  onDownload: () => void;
  onUpgrade: () => void;
  onClose: () => void;
}) {
  return (
    <>
      <div className={styles.preflightBody}>
        <p className={styles.preflightSummary}>
          Your {formatLabel} is built on this device and downloads straight
          away.
        </p>
        <p className={styles.checkSub}>
          Pro adds a KDP pre-flight check before export: word count, title,
          author, cover and metadata, each fixable right here.{" "}
          <button
            type="button"
            className={styles.inlineLink}
            onClick={() => {
              track("upgrade_clicked", { source: "preflight_export" });
              onUpgrade();
              onClose();
            }}
          >
            See Pro
          </button>
        </p>
      </div>

      <div className={styles.paneFoot}>
        <span />
        <span className={styles.pasteActions}>
          <button type="button" className={styles.quiet} onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className={styles.acid}
            onClick={() => {
              onDownload();
              onClose();
            }}
          >
            Export {formatLabel}
          </button>
        </span>
      </div>
    </>
  );
}
