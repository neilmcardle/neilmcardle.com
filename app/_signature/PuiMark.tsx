export default function PuiMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 30 30"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="1"
        y="1"
        width="28"
        height="28"
        rx="7"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M20.75 3.5H22a4.5 4.5 0 0 1 4.5 4.5v1.25a5.75 5.75 0 0 1-5.75 5.75 5.75 5.75 0 0 1-5.75-5.75 5.75 5.75 0 0 1 5.75-5.75Z"
        fill="currentColor"
        transform="translate(-2 2)"
      />
    </svg>
  );
}
