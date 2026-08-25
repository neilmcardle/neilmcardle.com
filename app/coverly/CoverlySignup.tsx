"use client";

import Link from "next/link";

export function CoverlySignup() {
  return (
    <div className="w-full">
      <Link
        href="/coverly/browse"
        className="block w-full rounded-full bg-foreground px-5 py-3 text-center text-sm font-medium text-background transition-opacity hover:opacity-90"
      >
        Be inspired
      </Link>
    </div>
  );
}
