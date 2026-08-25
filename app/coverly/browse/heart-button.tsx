"use client";

import { Heart } from "lucide-react";
import { useState } from "react";

export function HeartButton({
  liked,
  onToggle,
}: {
  liked: boolean;
  onToggle: () => void;
}) {
  const [justLiked, setJustLiked] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggle();
    if (!liked) {
      setJustLiked(true);
      setTimeout(() => setJustLiked(false), 600);
    }
  };

  return (
    <button
      onClick={handleClick}
      aria-label={liked ? "Unlike" : "Like"}
      className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
        liked
          ? "bg-background/90 text-red-500 backdrop-blur"
          : "bg-background/90 text-foreground backdrop-blur hover:bg-background"
      }`}
    >
      <Heart
        className={`h-4 w-4 ${liked ? "fill-current" : ""} ${
          justLiked && liked ? "animate-heart-pulse" : ""
        }`}
        strokeWidth={2}
      />
    </button>
  );
}
