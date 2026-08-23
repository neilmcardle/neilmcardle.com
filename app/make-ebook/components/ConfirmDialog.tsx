"use client";

import React from "react";
import { Modal, ModalBody, ModalFooter } from "./Modal";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "confirm" | "alert" | "destructive";
  onConfirm: () => void;
  onCancel?: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "OK",
  cancelLabel = "Cancel",
  variant = "confirm",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const isAlert = variant === "alert";
  const isDestructive = variant === "destructive";

  return (
    <Modal
      open={open}
      onClose={onCancel ?? onConfirm}
      width="sm"
      zIndex={10040}
      label={title}
    >
      <ModalBody>
        <h2 className="text-[15px] font-semibold text-gray-900 dark:text-[#f5f5f5]">
          {title}
        </h2>
        <p className="text-13 text-gray-600 dark:text-[#a3a3a3] mt-2 whitespace-pre-line">
          {message}
        </p>
      </ModalBody>
      <ModalFooter>
        {!isAlert && onCancel && (
          <button
            onClick={onCancel}
            className="px-4 h-9 rounded-control border border-gray-200 dark:border-white/10 text-125 font-medium text-gray-900 dark:text-[#f5f5f5] hover:bg-gray-50 dark:hover:bg-white/5 transition-colors duration-[var(--me-dur-fast)]"
          >
            {cancelLabel}
          </button>
        )}
        <button
          onClick={onConfirm}
          className={`px-4 h-9 rounded-control text-125 font-medium transition-colors duration-[var(--me-dur-fast)] ${
            isDestructive
              ? "bg-red-600 text-white hover:bg-red-700"
              : "bg-gray-900 dark:bg-white text-white dark:text-[#111] hover:bg-gray-800 dark:hover:bg-[#e5e5e5]"
          }`}
        >
          {confirmLabel}
        </button>
      </ModalFooter>
    </Modal>
  );
}
