"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useLikes } from "@/lib/coverly/use-likes";

export function LikesButton({ inToolbar = false }: { inToolbar?: boolean }) {
  const { likeCount } = useLikes();

  return (
    <Link
      href="/coverly/likes"
      aria-label={`View likes (${likeCount})`}
      className={
        inToolbar
          ? "flex h-[34px] items-center gap-1.5 rounded-[0.625rem] border bg-card px-3 text-sm hover:bg-muted"
          : "flex items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 text-sm hover:bg-muted"
      }
      title="View likes"
    >
      <Heart className="h-4 w-4 fill-red-500 text-red-500" strokeWidth={2} />
      <span className="text-xs font-medium">{likeCount}</span>
    </Link>
  );
}
