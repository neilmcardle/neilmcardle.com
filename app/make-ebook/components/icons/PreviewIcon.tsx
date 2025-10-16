import React from 'react';

interface PreviewIconProps {
  className?: string;
  stroke?: string;
}

export const PreviewIcon: React.FC<PreviewIconProps> = ({ 
  className = "w-6 h-6", 
  stroke = "currentColor"
}) => {
  return (
    <svg 
      className={className} 
      viewBox="0 0 26 25" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        d="M1 22.2344V2.76556C1 1.56257 2.05436 0.631795 3.24807 0.781009L12.7519 1.96899C12.9167 1.98958 13.0833 1.98958 13.2481 1.96899L22.7519 0.781009C23.9456 0.631795 25 1.56257 25 2.76556V22.2344C25 23.4374 23.9456 24.3682 22.7519 24.219L13.2481 23.031C13.0833 23.0104 12.9167 23.0104 12.7519 23.031L3.24807 24.219C2.05436 24.3682 1 23.4374 1 22.2344Z" 
        stroke={stroke} 
        strokeLinecap="round"
      />
      <path 
        d="M13 2V23" 
        stroke={stroke} 
        strokeLinecap="round"
      />
    </svg>
  );
};