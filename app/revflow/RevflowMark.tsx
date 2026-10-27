const DOTS = [1, 2, 3, 5, 6, 7].map((i) => {
  const a = (i * Math.PI) / 4;
  return {
    x: +(12 + 9 * Math.cos(a)).toFixed(3),
    y: +(12 + 9 * Math.sin(a)).toFixed(3),
    r:
      1.5 - 0.4 * Math.round(Math.cos(a) * Math.SQRT2) * Math.sign(Math.sin(a)),
  };
});

export default function RevflowMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      {DOTS.map(({ x, y, r }) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={r} />
      ))}
      <circle cx="3" cy="12" r="2.4" />
      <circle cx="21" cy="12" r="2.4" />
    </svg>
  );
}
