import React from 'react';

interface CenterAlignIconProps {
  className?: string;
  stroke?: string;
  fill?: string;
}

export const CenterAlignIcon: React.FC<CenterAlignIconProps> = ({ 
  className = "w-6 h-6", 
  stroke = "#050505",
  fill = "none"
}) => {
  return (
    <svg 
      className={className}
      viewBox="0 0 17 12" 
      fill={fill} 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        d="M0.5 11.5H16.5M3.16667 6H13.8333M0.5 0.5H16.5" 
        stroke={stroke} 
        strokeLinecap="round"
      />
    </svg>
  );
};