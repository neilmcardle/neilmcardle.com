import React from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";

interface Props {
  bookId?: string;
}

export default function AiTabContent({ bookId }: Props) {
  const href = bookId ? `/make-ebook/book-mind?book=${bookId}` : "/make-ebook/book-mind";

  return (
    <div className="p-4">
      <div className="rounded-xl border border-gray-100 dark:border-[#2f2f2f] bg-gray-50 dark:bg-[#111] p-5 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-gray-500 dark:text-[#a3a3a3] flex-shrink-0" />
          <p className="text-sm font-semibold text-gray-800 dark:text-[#e5e5e5]">Book Mind</p>
        </div>
        <p className="text-xs text-gray-500 dark:text-[#a3a3a3] leading-relaxed">
          Ask questions about your manuscript. Book Mind reads your book and helps you think — without writing for you.
        </p>
        <Link
          href={href}
          className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-[#111] text-xs font-semibold hover:bg-gray-700 dark:hover:bg-[#e5e5e5] transition-colors"
        >
          Open Book Mind
        </Link>
      </div>
    </div>
  );
}
