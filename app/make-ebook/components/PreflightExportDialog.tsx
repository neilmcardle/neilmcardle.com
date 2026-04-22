"use client";

// Pre-flight gate at export time. Pro users see the KDP checks and are
// blocked from downloading if any hard check fails. Free users see a
// compact "skipped" strip with an upgrade pitch and can still proceed.
// Fires `preflight_viewed` with source='export', `preflight_blocked_export`
// when hard blocks prevent download, and `upgrade_clicked` from the Free
// upgrade CTA.

import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { track } from "@vercel/analytics";
import { runPreflightChecks, PreflightInput, CheckResult } from "../utils/preflightChecks";

export type ExportFormat = "epub" | "pdf" | "docx";

interface PreflightExportDialogProps {
  open: boolean;
  format: ExportFormat;
  input: PreflightInput;
  isPro: boolean;
  onClose: () => void;
  onDownload: () => void;
  onUpgrade: () => void;
}

const FORMAT_LABEL: Record<ExportFormat, string> = {
  epub: "EPUB",
  pdf: "PDF",
  docx: "Word",
};

export default function PreflightExportDialog({
  open,
  format,
  input,
  isPro,
  onClose,
  onDownload,
  onUpgrade,
}: PreflightExportDialogProps) {
  const result = runPreflightChecks(input);
  const { checks, blocks, warns, allClear } = result;

  useEffect(() => {
    if (!open) return;
    track("preflight_viewed", { source: "export", tier: isPro ? "pro" : "free", format });
    if (isPro && blocks.length > 0) {
      track("preflight_blocked_export", { format, blockCount: blocks.length });
    }
  }, [open, isPro, format, blocks.length]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  const formatLabel = FORMAT_LABEL[format];

  const dialog = (
    <div
      className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden border border-gray-200 dark:border-[#2f2f2f] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-gray-200 dark:border-[#2f2f2f] flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Export {formatLabel}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-500 hover:text-gray-900 dark:text-[#a3a3a3] dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-[#2f2f2f] transition-colors"
            aria-label="Close"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {isPro ? (
          <ProBody
            checks={checks}
            blocks={blocks}
            warns={warns}
            allClear={allClear}
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
      </div>
    </div>
  );

  return createPortal(dialog, document.body);
}

function ProBody({
  checks, blocks, warns, allClear, formatLabel, onDownload, onClose,
}: {
  checks: CheckResult[];
  blocks: CheckResult[];
  warns: CheckResult[];
  allClear: boolean;
  formatLabel: string;
  onDownload: () => void;
  onClose: () => void;
}) {
  const canDownload = allClear;
  let buttonLabel = `Download ${formatLabel}`;
  if (!canDownload) {
    buttonLabel = `Fix ${blocks.length} ${blocks.length === 1 ? "issue" : "issues"} to export`;
  } else if (warns.length > 0) {
    buttonLabel = `Download anyway (${warns.length} ${warns.length === 1 ? "warning" : "warnings"})`;
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto min-h-0 px-6 py-5 space-y-4">
        <p className="text-xs text-gray-500 dark:text-[#a3a3a3] uppercase tracking-wider font-semibold">
          Amazon KDP pre-flight
        </p>

        <ul className="space-y-2.5">
          {checks.map(check => (
            <li key={check.id} className="flex items-start gap-2.5">
              <StatusDot status={check.status} />
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {check.label}
                </span>
                <p className="text-xs text-gray-500 dark:text-[#a3a3a3] leading-relaxed mt-0.5">
                  {check.message}
                </p>
              </div>
            </li>
          ))}
        </ul>

        {blocks.length > 0 && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40">
            <p className="text-xs font-medium text-red-700 dark:text-red-400">
              {blocks.length} blocking {blocks.length === 1 ? "issue" : "issues"} must be fixed. Amazon will reject or delist books that fail these checks.
            </p>
          </div>
        )}

        {allClear && warns.length > 0 && (
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40">
            <p className="text-xs text-amber-700 dark:text-amber-400">
              {warns.length} {warns.length === 1 ? "recommendation" : "recommendations"} worth addressing before publishing.
            </p>
          </div>
        )}

        {allClear && warns.length === 0 && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40">
            <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
              All checks pass. Your book is ready to export.
            </p>
          </div>
        )}
      </div>

      <div className="px-6 py-4 border-t border-gray-200 dark:border-[#2f2f2f] flex items-center justify-end gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-[#d4d4d4] hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => { onDownload(); onClose(); }}
          disabled={!canDownload}
          className="px-5 py-2.5 text-sm font-semibold bg-gray-900 dark:bg-white text-white dark:text-[#111] rounded-full hover:bg-gray-800 dark:hover:bg-[#e5e5e5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {buttonLabel}
        </button>
      </div>
    </>
  );
}

function FreeBody({
  formatLabel, onDownload, onUpgrade, onClose,
}: {
  formatLabel: string;
  onDownload: () => void;
  onUpgrade: () => void;
  onClose: () => void;
}) {
  return (
    <>
      <div className="px-6 py-5 space-y-4">
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40">
          <svg className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-amber-900 dark:text-amber-200 mb-1">
              Pre-flight check skipped
            </p>
            <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
              Amazon delists eBooks that fail KDP quality checks. Pro users verify word count, metadata, and AI-disclosure compliance before downloading. You can export without the check, but you're flying blind.
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 border-t border-gray-200 dark:border-[#2f2f2f] flex items-center justify-between gap-3">
        <button
          onClick={() => { onDownload(); onClose(); }}
          className="text-sm font-medium text-gray-600 dark:text-[#a3a3a3] hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          Download {formatLabel} anyway
        </button>
        <button
          onClick={() => { track("upgrade_clicked", { source: "preflight_export" }); onUpgrade(); onClose(); }}
          className="px-5 py-2.5 text-sm font-semibold bg-gray-900 dark:bg-white text-white dark:text-[#111] rounded-full hover:bg-gray-800 dark:hover:bg-[#e5e5e5] transition-colors"
        >
          Upgrade to Pro
        </button>
      </div>
    </>
  );
}

function StatusDot({ status }: { status: "pass" | "warn" | "block" }) {
  const colors: Record<typeof status, string> = {
    pass: "bg-emerald-500",
    warn: "bg-amber-500",
    block: "bg-red-500",
  };
  return <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${colors[status]}`} />;
}
