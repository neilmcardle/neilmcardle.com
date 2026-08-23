"use client";

import React, { useId } from "react";

interface BookMindMarkProps {
  className?: string;
}

export default function BookMindMark({ className }: BookMindMarkProps) {
  const maskId = useId();

  return (
    <svg
      className={className}
      viewBox="0 0 13 13"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <mask id={maskId}>
        <rect width="13" height="13" rx="3" fill="white" />
        <rect x="6" y="5" width="2" height="3" rx="1" fill="black" />
        <rect x="9" y="5" width="2" height="3" rx="1" fill="black" />
      </mask>
      <rect
        width="13"
        height="13"
        rx="3"
        fill="currentColor"
        mask={`url(#${maskId})`}
      />
    </svg>
  );
}
