interface BetterThingsLogoProps {
    className?: string
    width?: number
    height?: number
  }
  
  export function BetterThingsLogo({ className = "", width = 24, height = 24 }: BetterThingsLogoProps) {
    return (
      <svg width={width} height={height} viewBox="0 0 73.68 73.68" className={className} aria-label="Better Things Logo">
        <g>
          <path d="M0,0v73.68h73.68V0H0ZM65.68,65.68H8V8h57.68v57.68Z" />
          <path d="M51.5,39.67c-1.33-1.75-3.14-2.91-5.43-3.48,2.01-.78,3.58-2,4.7-3.68,1.13-1.67,1.7-3.6,1.7-5.79,0-4.02-1.41-7.07-4.22-9.16-2.81-2.08-6.93-3.12-12.37-3.12h-15.68v44.79h17.41c5.08-.04,9-1.17,11.75-3.38,2.75-2.22,4.12-5.48,4.12-9.79,0-2.52-.66-4.65-1.98-6.39ZM29.42,21.92h6.46c2.55,0,4.41.44,5.59,1.34,1.18.89,1.77,2.35,1.77,4.38,0,3.63-2.33,5.48-6.99,5.57h-6.83v-11.29ZM42.42,50.26c-1.22,1.04-2.92,1.56-5.09,1.56h-7.91v-12.09h8.46c4.25.06,6.37,2.14,6.37,6.24,0,1.83-.61,3.26-1.83,4.29Z" />
        </g>
      </svg>
    )
  }
  
  