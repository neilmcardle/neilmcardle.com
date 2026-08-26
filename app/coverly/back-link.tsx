"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, LayoutGrid } from "lucide-react";
import { getLastBrowse } from "@/lib/coverly/last-browse";

export function BackLink({
  fallbackHref = "/coverly/browse",
  label = "Back",
}: {
  fallbackHref?: string;
  label?: string;
}) {
  const router = useRouter();

  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push(fallbackHref);
  };

  return (
    <div className="mb-5 flex flex-wrap items-center gap-2">
      <button
        onClick={goBack}
        className="inline-flex items-center gap-1 rounded-full border bg-card px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted/60 hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" strokeWidth={2} />
        {label}
      </button>
      <button
        onClick={() => router.push(getLastBrowse())}
        className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted/60 hover:text-foreground"
      >
        <LayoutGrid className="h-3.5 w-3.5" strokeWidth={2} />
        All covers
      </button>
    </div>
  );
}
