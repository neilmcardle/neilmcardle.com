"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { getLikedCoversSync } from "@/lib/coverly/use-likes";
import { type CoverCard } from "@/lib/coverly/queries";
import { fetchLikedCovers } from "./actions";

export function LikedCoversClient() {
  const [covers, setCovers] = useState<CoverCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCovers = async () => {
      const likedIds = getLikedCoversSync();
      if (likedIds.length === 0) {
        setCovers([]);
        setLoading(false);
        return;
      }

      try {
        const data = await fetchLikedCovers(likedIds);
        if (data) {
          setCovers(data);
        }
      } catch {
        setCovers([]);
      }

      setLoading(false);
    };

    fetchCovers();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-40 rounded-lg bg-muted" />
      </div>
    );
  }

  if (covers.length === 0) {
    return (
      <div className="rounded-2xl border bg-card p-12 text-center">
        <Heart
          className="mx-auto mb-3 h-12 w-12 text-muted-foreground"
          strokeWidth={1.5}
        />
        <p className="mb-4 text-muted-foreground">No liked covers yet.</p>
        <Link
          href="/coverly/browse"
          className="inline-block rounded-full bg-foreground px-6 py-2 text-sm font-medium text-background hover:opacity-90"
        >
          Browse and like covers
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {covers.map((cover) => (
        <Link
          key={cover.id}
          href={`/coverly/covers/${cover.id}`}
          className="flex gap-4 rounded-lg border bg-card p-4 transition-colors hover:bg-card/80"
        >
          <div className="h-24 w-16 flex-shrink-0 overflow-hidden rounded">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cover.image_url}
              alt={cover.title}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="line-clamp-2 font-semibold">{cover.title}</h2>
            <p className="text-sm text-muted-foreground">
              {cover.author ?? "Unknown author"}
              {cover.year ? ` · ${cover.year}` : ""}
            </p>
            {cover.imprint && (
              <p className="text-xs text-muted-foreground">{cover.imprint}</p>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
