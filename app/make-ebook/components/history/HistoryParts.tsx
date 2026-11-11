"use client";

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 text-center">
      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 dark:bg-[var(--ink-raised)] flex items-center justify-center">
        <svg
          className="w-6 h-6 text-[var(--clay-muted)]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.6}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h3 className="text-sm font-medium text-gray-900 dark:text-[var(--paper)] mb-1">
        {title}
      </h3>
      <p className="text-xs text-gray-500 dark:text-[var(--clay-muted)]">
        {description}
      </p>
    </div>
  );
}

export function LatestPill() {
  return (
    <span className="inline-flex items-center h-5 px-2 rounded-full border border-[rgba(243,239,229,0.22)] text-[11px] font-medium text-[var(--paper)]">
      Latest
    </span>
  );
}

export function Chevron({ expanded }: { expanded: boolean }) {
  return (
    <svg
      className={`w-4 h-4 text-[var(--clay-muted)] transition-transform ${expanded ? "rotate-180" : ""}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.6}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  );
}

export function TrashIcon() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.6}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  );
}

export function ClearAllFooter({
  label,
  confirmLabel,
  confirmClear,
  setConfirmClear,
  onConfirm,
}: {
  label: string;
  confirmLabel: string;
  confirmClear: boolean;
  setConfirmClear: (v: boolean) => void;
  onConfirm: () => void;
}) {
  return (
    <div className="p-3 border-t border-gray-200 dark:border-[var(--rule)]">
      {confirmClear ? (
        <div className="flex items-center gap-2">
          <span className="text-xs text-red-600 dark:text-red-400 flex-1">
            {confirmLabel}
          </span>
          <button
            onClick={() => {
              onConfirm();
              setConfirmClear(false);
            }}
            className="px-3 py-2 rounded text-xs font-medium bg-red-600 text-white hover:bg-red-700"
          >
            Yes, clear all
          </button>
          <button
            onClick={() => setConfirmClear(false)}
            className="px-3 py-2 rounded text-xs font-medium border border-gray-200 dark:border-[var(--rule)] hover:bg-gray-100 dark:hover:bg-[var(--rule)]"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setConfirmClear(true)}
          className="w-full py-2 text-xs text-gray-500 dark:text-[var(--clay-muted)] hover:text-red-600 dark:hover:text-red-400 transition-colors"
        >
          {label}
        </button>
      )}
    </div>
  );
}
