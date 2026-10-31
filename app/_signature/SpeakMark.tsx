export default function SpeakMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M3.5 10v4M7.75 7v10M12 3.5v17M16.25 7v10M20.5 10v4" />
    </svg>
  );
}
