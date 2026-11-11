"use client";

import { Modal, ModalHeader } from "./Modal";
import React, { useState } from "react";
import { BookVersion } from "../hooks/useVersionHistory";
import { EPUBExportMeta } from "../hooks/useExportHistory";
import { Chapter } from "../types";
import VersionsTab from "./history/VersionsTab";
import ExportsTab from "./history/ExportsTab";
import { ClearAllFooter } from "./history/HistoryParts";

type HistoryTab = "versions" | "exports";

interface HistoryPanelProps {
  onClose: () => void;
  initialTab?: HistoryTab;

  versions: BookVersion[];
  currentWordCount: number;
  onRestoreVersion: (
    chapters: Chapter[],
    metadata: BookVersion["metadata"],
  ) => void;
  onDeleteVersion: (versionId: string) => void;
  onClearAllVersions: () => void;

  exports: EPUBExportMeta[];
  exportsLoading: boolean;
  onPreviewExport: (exportId: string) => void;
  onDownloadExport: (exportId: string) => void;
  onDeleteExport: (exportId: string) => void;
  onClearAllExports: () => void;
}

export default function HistoryPanel({
  onClose,
  initialTab = "versions",
  versions,
  currentWordCount,
  onRestoreVersion,
  onDeleteVersion,
  onClearAllVersions,
  exports,
  exportsLoading,
  onPreviewExport,
  onDownloadExport,
  onDeleteExport,
  onClearAllExports,
}: HistoryPanelProps) {
  const [activeTab, setActiveTab] = useState<HistoryTab>(initialTab);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const switchTab = (next: HistoryTab) => {
    if (next === activeTab) return;
    setActiveTab(next);
    setExpandedId(null);
    setConfirmClear(false);
  };

  return (
    <Modal open onClose={onClose} width="sm" zIndex={10030} label="History">
      <ModalHeader title="History" onClose={onClose} />

      <div
        className="flex-shrink-0 flex border-b border-gray-200 dark:border-white/10"
        role="tablist"
      >
        <button
          role="tab"
          aria-selected={activeTab === "versions"}
          onClick={() => switchTab("versions")}
          className={`flex-1 px-4 py-2.5 text-10 font-medium uppercase tracking-[0.15em] transition-colors duration-[var(--me-dur-fast)] ${
            activeTab === "versions"
              ? "text-gray-900 dark:text-[var(--paper)] border-b-2 border-gray-900 dark:border-[var(--paper)] -mb-px"
              : "text-gray-500 dark:text-[var(--clay-muted)] hover:text-gray-700 dark:hover:text-[var(--clay)]"
          }`}
        >
          Versions
          {versions.length > 0 && (
            <span className="ml-2 text-gray-400 dark:text-[var(--clay-muted)]">
              {versions.length}
            </span>
          )}
        </button>
        <button
          role="tab"
          aria-selected={activeTab === "exports"}
          onClick={() => switchTab("exports")}
          className={`flex-1 px-4 py-2.5 text-10 font-medium uppercase tracking-[0.15em] transition-colors duration-[var(--me-dur-fast)] ${
            activeTab === "exports"
              ? "text-gray-900 dark:text-[var(--paper)] border-b-2 border-gray-900 dark:border-[var(--paper)] -mb-px"
              : "text-gray-500 dark:text-[var(--clay-muted)] hover:text-gray-700 dark:hover:text-[var(--clay)]"
          }`}
        >
          Exports
          {exports.length > 0 && (
            <span className="ml-2 text-gray-400 dark:text-[var(--clay-muted)]">
              {exports.length}
            </span>
          )}
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        {activeTab === "versions" ? (
          <VersionsTab
            versions={versions}
            currentWordCount={currentWordCount}
            expandedId={expandedId}
            setExpandedId={setExpandedId}
            onRestore={(chapters, metadata) => {
              onRestoreVersion(chapters, metadata);
              setExpandedId(null);
            }}
            onDelete={onDeleteVersion}
          />
        ) : (
          <ExportsTab
            exports={exports}
            isLoading={exportsLoading}
            expandedId={expandedId}
            setExpandedId={setExpandedId}
            onPreview={(id) => {
              onPreviewExport(id);
              setExpandedId(null);
            }}
            onDownload={onDownloadExport}
            onDelete={onDeleteExport}
          />
        )}
      </div>

      {activeTab === "versions" && versions.length > 1 && (
        <ClearAllFooter
          label="Clear all version history"
          confirmLabel="Delete all versions?"
          confirmClear={confirmClear}
          setConfirmClear={setConfirmClear}
          onConfirm={onClearAllVersions}
        />
      )}
      {activeTab === "exports" && exports.length > 1 && (
        <ClearAllFooter
          label="Clear all export history"
          confirmLabel="Delete all exports?"
          confirmClear={confirmClear}
          setConfirmClear={setConfirmClear}
          onConfirm={onClearAllExports}
        />
      )}
    </Modal>
  );
}
