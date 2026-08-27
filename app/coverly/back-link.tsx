"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, LayoutGrid } from "lucide-react";
import { getLastBrowse, useLastBrowse } from "@/lib/coverly/last-browse";

export function BackLink({ label = "Back" }: { label?: string }) {
  const router = useRouter();
  const browseHref = useLastBrowse();

  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push(getLastBrowse());
  };

  return (
    <div
      style={{ top: "var(--coverly-header-h, 3.5rem)" }}
      className="sticky z-30 -mx-4 mb-4 flex flex-wrap items-center gap-2 bg-background/85 px-4 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/70 sm:-mx-6 sm:px-6"
    >
      <button
        onClick={goBack}
        className="inline-flex items-center gap-1 rounded-full border bg-card px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted/60 hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" strokeWidth={2} />
        {label}
      </button>
      <button
        onClick={() => router.push(browseHref)}
        className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted/60 hover:text-foreground"
      >
        <LayoutGrid className="h-3.5 w-3.5" strokeWidth={2} />
        All covers
      </button>
    </div>
  );
}
