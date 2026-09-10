import {
  BOARDS_MARK_PATHS,
  BOARDS_MARK_VIEWBOX,
} from "@/lib/coverly/boards-mark";

export function BoardsIcon({
  className,
}: {
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox={BOARDS_MARK_VIEWBOX}
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      {BOARDS_MARK_PATHS.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
