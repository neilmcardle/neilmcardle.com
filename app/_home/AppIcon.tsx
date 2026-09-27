export type AppIconKey =
  | "vectorPaint"
  | "iconAnimator"
  | "promptr"
  | "tessera"
  | "kidsAlphabet"
  | "timeTeacher"
  | "touchtype";

const HEX = [
  [21, 12],
  [16.5, 19.8],
  [7.5, 19.8],
  [3, 12],
  [7.5, 4.2],
  [16.5, 4.2],
] as const;

function Glyph({ icon }: { icon: AppIconKey }) {
  switch (icon) {
    case "vectorPaint":
      return (
        <path
          d="M3.4 6.4Q7.1 13.1 10.1 19.1Q13.9 11.3 16.9 6.2C18.2 3.8 21.8 4.2 21.2 6.8C20.7 8.9 17.9 8.7 16.9 6.2"
          transform="translate(-0.6 0.6)"
        />
      );
    case "iconAnimator":
      return (
        <>
          <rect x="3" y="11" width="10" height="10" rx="2.5" opacity="0.3" />
          <rect x="7" y="7" width="10" height="10" rx="2.5" opacity="0.6" />
          <rect x="11" y="3" width="10" height="10" rx="2.5" />
        </>
      );
    case "promptr":
      return <path d="M5 7.5l4.5 4.5L5 16.5M12.5 16.5H19" />;
    case "tessera":
      return (
        <>
          <path
            d={`M${HEX.map(([x, y]) => `${x} ${y}`).join("L")}ZM3 12H21M7.5 4.2L16.5 19.8M16.5 4.2L7.5 19.8`}
          />
          {HEX.map(([x, y]) => (
            <circle
              key={`${x}-${y}`}
              cx={x}
              cy={y}
              r="1.3"
              fill="currentColor"
              stroke="none"
            />
          ))}
        </>
      );
    case "kidsAlphabet":
      return <path d="M5.5 20L12 4L18.5 20M8 14h8" />;
    case "timeTeacher":
      return (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3.5 2" />
        </>
      );
    case "touchtype":
      return (
        <>
          <rect x="2.5" y="6" width="19" height="12" rx="2.5" />
          <path d="M6.5 10h0M10 10h0M13.5 10h0M17 10h0M8.5 14h7" />
        </>
      );
  }
}

export default function AppIcon({
  icon,
  className,
}: {
  icon: AppIconKey;
  className?: string;
}) {
  return (
    <span className={className} aria-hidden="true">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Glyph icon={icon} />
      </svg>
    </span>
  );
}
