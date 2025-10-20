interface BetterThingsIconStampProps {
  className?: string
  width?: number
  height?: number
}

export function BetterThingsIconStamp({ className = "", width = 120, height = 120 }: BetterThingsIconStampProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 73.68 73.68"
      className={className}
      aria-label="Better Things Icon Stamp"
    >
      <g>
        <path d="M0,0v73.68h73.68V0H0ZM65.68,65.68H8V8h57.68v57.68Z" />
      </g>
    </svg>
  )
}
