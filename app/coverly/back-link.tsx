"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

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
    <button
      onClick={goBack}
      className="mb-5 inline-flex items-center gap-1 rounded-full border bg-card px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted/60 hover:text-foreground"
    >
      <ChevronLeft className="h-4 w-4" strokeWidth={2} />
      {label}
    </button>
  );
}
