"use client";

import Link from "next/link";
import type { ComponentProps } from "react";

export const INSIDE_KEY = "nm-inside";

export default function BackLink({
  href = "/",
  onClick,
  ...props
}: Omit<ComponentProps<typeof Link>, "href"> & { href?: string }) {
  return (
    <Link
      href={href}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented || event.metaKey || event.ctrlKey) return;
        let inside = false;
        try {
          inside = sessionStorage.getItem(INSIDE_KEY) === "1";
        } catch {}
        if (inside && window.history.length > 1) {
          event.preventDefault();
          window.history.back();
        }
      }}
      {...props}
    />
  );
}
