import React from 'react';

interface LeftAlignIconProps {
  className?: string;
  stroke?: string;
  fill?: string;
}

export const LeftAlignIcon: React.FC<LeftAlignIconProps> = ({ 
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
        d="M0.5 11.5H16.5M0.5 6H8.5M0.5 0.5H16.5" 
        stroke={stroke} 
        strokeLinecap="round"
      />
    </svg>
  );
};