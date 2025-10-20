export function PictureFrameIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <rect x="7" y="7" width="10" height="10" rx="1" ry="1" />
      <line x1="3" y1="3" x2="7" y2="7" />
      <line x1="21" y1="3" x2="17" y2="7" />
      <line x1="3" y1="21" x2="7" y2="17" />
      <line x1="21" y1="21" x2="17" y2="17" />
    </svg>
  )
}
