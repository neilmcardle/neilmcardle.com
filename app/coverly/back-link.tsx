"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, LayoutGrid } from "lucide-react";
import { getLastBrowse, useLastBrowse } from "@/lib/coverly/last-browse";

const PILL =
  "inline-flex items-center gap-1.5 rounded-full border bg-card text-sm text-muted-foreground hover:bg-muted/60 hover:text-foreground";

export function BackControls({
  label = "Back",
  compact = false,
}: {
  label?: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const browseHref = useLastBrowse();

  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push(getLastBrowse());
  };

  return (
    <>
      <button
        onClick={goBack}
        aria-label={label}
        className={`${PILL} ${compact ? "h-8 w-8 justify-center gap-0 px-0" : "px-3 py-1.5"}`}
      >
        <ChevronLeft className="h-4 w-4" strokeWidth={2} />
        {!compact && label}
      </button>
      <button
        onClick={() => router.push(browseHref)}
        className={`${PILL} ${compact ? "h-8 px-3" : "px-3 py-1.5"}`}
      >
        <LayoutGrid className="h-3.5 w-3.5" strokeWidth={2} />
        All covers
      </button>
    </>
  );
}

export function BackLink({ label = "Back" }: { label?: string }) {
  return (
    <div
      style={{ top: "var(--coverly-header-h, 3.5rem)" }}
      className="sticky z-30 -mx-4 mb-4 hidden flex-wrap items-center gap-2 bg-background/85 px-4 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/70 sm:-mx-6 sm:px-6 md:flex"
    >
      <BackControls label={label} />
    </div>
  );
}
