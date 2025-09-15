"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

export function BackArrowButton({
  label = "Back",
  className = "",
  to,
}: {
  label?: string;
  className?: string;
  to?: string;
}) {
  const router = useRouter();

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    if (to) {
      router.push(to);
    } else {
      router.back();
    }
  }

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100 text-[#23242a] font-medium transition ${className}`}
      aria-label={label}
      type="button"
    >
      <ChevronLeft className="w-5 h-5" />
      <span className="text-sm">{label}</span>
    </button>
  );
}