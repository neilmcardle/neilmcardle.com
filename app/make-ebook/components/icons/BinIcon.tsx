import { CSSProperties } from "react";

interface BinIconProps {
  className?: string;
  style?: CSSProperties;
  stroke?: string;
}

export default function BinIcon({ className = "w-4 h-4", style, stroke = "currentColor" }: BinIconProps) {
  return (
    <svg 
      width="26" 
      height="26" 
      viewBox="0 0 26 26" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ ...style, stroke }}
    >
      <path 
        d="M1 5.61538H4M25 5.61538H22M22 5.61538V23C22 24.1046 21.1046 25 20 25H6C4.89543 25 4 24.1046 4 23V5.61538M22 5.61538H18M4 5.61538H8M8 5.61538V3C8 1.89543 8.89543 1 10 1H16C17.1046 1 18 1.89543 18 3V5.61538M8 5.61538H18M15.5 11.1538V19.9231M10.5 11.1538V19.9231" 
        stroke="inherit"
        strokeLinecap="round"
      />
    </svg>
  );
}