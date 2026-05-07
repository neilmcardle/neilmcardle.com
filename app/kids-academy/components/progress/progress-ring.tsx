type Props = {
  percentage: number
  size?: number
  strokeWidth?: number
  trackClassName?: string
  fillClassName?: string
  label?: string
}

export function ProgressRing({
  percentage,
  size = 48,
  strokeWidth = 5,
  trackClassName = 'stroke-ka-brand-50',
  fillClassName = 'stroke-ka-brand-600',
  label,
}: Props) {
  const clamped = Math.min(100, Math.max(0, percentage))
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (clamped / 100) * circumference

  return (
    <span
      className="inline-flex items-center justify-center relative"
      style={{ width: size, height: size }}
      role="img"
      aria-label={label ?? `${Math.round(clamped)}% complete`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className={trackClassName}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={`${fillClassName} transition-[stroke-dashoffset] duration-500 ease-out`}
        />
      </svg>
      {clamped > 0 && (
        <span className="absolute inset-0 flex items-center justify-center text-2xs font-semibold text-slate-700">
          {Math.round(clamped)}%
        </span>
      )}
    </span>
  )
}
