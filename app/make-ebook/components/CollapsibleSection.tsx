"use client";

import React, { useEffect, useLayoutEffect, useRef } from "react";

interface CollapsibleSectionProps {
  expanded: boolean;
  children: React.ReactNode;
}

export default function CollapsibleSection({
  expanded,
  children,
}: CollapsibleSectionProps) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  const sync = () => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;
    outer.style.height = expanded ? `${inner.offsetHeight}px` : "0px";
  };

  useLayoutEffect(sync);

  useEffect(() => {
    const inner = innerRef.current;
    if (!inner || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(sync);
    observer.observe(inner);
    return () => observer.disconnect();
  });

  return (
    <div
      ref={outerRef}
      aria-hidden={!expanded}
      className="overflow-hidden transition-[height,opacity] duration-[260ms] ease-out motion-reduce:transition-none"
      style={{
        opacity: expanded ? 1 : 0,
        pointerEvents: expanded ? undefined : "none",
      }}
    >
      <div ref={innerRef}>{children}</div>
    </div>
  );
}
