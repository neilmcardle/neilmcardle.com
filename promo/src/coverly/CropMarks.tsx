import type { CSSProperties } from "react";

const CORNERS = [
  { top: true, left: true },
  { top: true, left: false },
  { top: false, left: true },
  { top: false, left: false },
];

export function CropMarks({
  color,
  opacity,
  inset = 72,
  size = 56,
  draw = [1, 1, 1, 1],
}: {
  color: string;
  opacity: number;
  inset?: number;
  size?: number;
  draw?: number[];
}) {
  return (
    <>
      {CORNERS.map((corner, index) => {
        const length = size * (draw[index] ?? 1);
        const line = 2;
        const base: CSSProperties = {
          position: "absolute",
          background: color,
          opacity,
        };
        const v = corner.top ? { top: inset } : { bottom: inset };
        const h = corner.left ? { left: inset } : { right: inset };
        return (
          <div key={index}>
            <div style={{ ...base, ...v, ...h, width: length, height: line }} />
            <div style={{ ...base, ...v, ...h, width: line, height: length }} />
          </div>
        );
      })}
    </>
  );
}
