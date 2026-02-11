'use client';

import React from 'react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'confirm' | 'alert' | 'destructive';
  onConfirm: () => void;
  onCancel?: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'OK',
  cancelLabel = 'Cancel',
  variant = 'confirm',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  const isAlert = variant === 'alert';
  const isDestructive = variant === 'destructive';

  return (
    <div className="fixed inset-0 z-[140] bg-black/20 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#0a0a0a] rounded-xl p-6 max-w-md w-full animate-in fade-in zoom-in-95 duration-150" style={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.06)' }}>
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">{title}</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 whitespace-pre-line">{message}</p>
        <div className="flex gap-3 justify-end">
          {!isAlert && onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              {cancelLabel}
            </button>
          )}
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isDestructive
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
