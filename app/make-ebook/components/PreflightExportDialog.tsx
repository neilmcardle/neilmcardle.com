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

export type ExportFormat = "epub" | "pdf" | "docx";

export interface PreflightFixes {
  setTitle: (value: string) => void;
  setAuthor: (value: string) => void;
  setGenre: (value: string) => void;
  setLanguage: (value: string) => void;
  onCoverChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onShowChapters: () => void;
}

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
    if (check.id === "genre") return input.genre ?? "";
    return "";
  });

  if (check.id === "title" || check.id === "author" || check.id === "genre") {
    const setter =
      check.id === "title"
        ? fixes.setTitle
        : check.id === "author"
          ? fixes.setAuthor
          : fixes.setGenre;
    const placeholder =
      check.id === "title"
        ? "Your book's title"
        : check.id === "author"
          ? "Name as it appears on the cover"
          : "Literary fiction, thriller, memoir...";
    return (
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
    );
  }

  if (check.id === "language") {
    return (
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
    );
  }

  if (check.id === "cover") {
    return (
      <label className={styles.fixButton}>
        Add a cover
        <input
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={fixes.onCoverChange}
        />
      </label>
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
  const sorted = [...checks].sort((a, b) => ORDER[a.status] - ORDER[b.status]);
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
                {check.status !== "pass" && (
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
