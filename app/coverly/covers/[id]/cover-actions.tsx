"use client";

import { Heart } from "lucide-react";
import { LayoutGroup, motion } from "framer-motion";
import { useRef, useState } from "react";
import { useLikes } from "@/lib/coverly/use-likes";
import { AddToBoard } from "../../browse/add-to-board";

const SPRING = {
  type: "spring" as const,
  stiffness: 420,
  damping: 36,
  mass: 0.8,
};

export function CoverActions({ coverId }: { coverId: string }) {
  const { isLiked, toggle } = useLikes();
  const liked = isLiked(coverId);
  const [justLiked, setJustLiked] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onLike = () => {
    toggle(coverId);
    if (liked) return;
    if (timer.current) clearTimeout(timer.current);
    setJustLiked(true);
    timer.current = setTimeout(() => setJustLiked(false), 1000);
  };

  return (
    <LayoutGroup>
      <div className="mt-6 flex items-center gap-2">
        <AddToBoard
          coverId={coverId}
          variant="button"
          flyFrom={() =>
            document.querySelector<HTMLImageElement>("[data-cover-hero]")
          }
        />
        <motion.div layout transition={SPRING}>
          <button
            onClick={onLike}
            aria-pressed={liked}
            className="flex items-center gap-2 rounded-[0.625rem] border px-4 py-2 text-sm hover:bg-muted/60"
          >
            <Heart
              className={`h-4 w-4 ${liked ? "fill-red-500 text-red-500" : "text-muted-foreground"} ${
                justLiked && liked ? "animate-heart-pulse" : ""
              }`}
              strokeWidth={2}
            />
            {liked ? "Liked" : "Like"}
          </button>
        </motion.div>
      </div>
    </LayoutGroup>
  );
}
