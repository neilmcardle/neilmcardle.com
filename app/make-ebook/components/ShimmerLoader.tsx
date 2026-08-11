"use client";

import { useEffect, useState } from "react";

interface ShimmerLoaderProps {
  label?: string;
  variant?: "dots" | "bar";
}

export function ShimmerLoader({ label = "Processing", variant = "dots" }: ShimmerLoaderProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(e => e + 0.1);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const displayTime = elapsed < 60 ? elapsed.toFixed(1) : `${Math.floor(elapsed / 60)}m ${(elapsed % 60).toFixed(1)}s`;

  return (
    <div className="flex items-center gap-2">
      {variant === "dots" && (
        <span aria-hidden className="flex gap-1">
          {[0, 1, 2].map(i => (
            <span
              key={i}
              className="size-1.5 rounded-full bg-gray-400 dark:bg-[#737373]"
              style={{
                animation: 'pulse 1.5s ease-in-out infinite',
                animationDelay: `${i * 200}ms`,
              }}
            />
          ))}
        </span>
      )}
      <span className="text-12 font-medium text-gray-700 dark:text-[#d4d4d4]">
        {label}
      </span>
      <span className="text-11 font-mono text-gray-500 dark:text-[#888] tabular-nums">
        {displayTime}s
      </span>
    </div>
  );
}
