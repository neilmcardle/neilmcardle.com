import React, { useState } from "react";

export default function SimpleTooltip({ text, children }: { text: string, children: React.ReactNode }) {
  const [show, setShow] = useState(false);
  return (
    <span
      className="relative"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
      tabIndex={0}
    >
      {children}
      {show && (
        <span className="absolute z-50 left-1/2 -translate-x-1/2 mt-2 px-2 py-1 rounded bg-black text-white text-xs whitespace-nowrap shadow pointer-events-none">
          {text}
        </span>
      )}
    </span>
  );
}