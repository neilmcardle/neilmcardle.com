import React from 'react';

interface BookIconProps {
  className?: string;
  stroke?: string;
  fill?: string;
}

export const BookIcon: React.FC<BookIconProps> = ({ 
  className = "w-6 h-6", 
  stroke = "#050505",
  fill = "none"
}) => {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill={fill} 
      stroke="currentColor"
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      <path d="M8 7h8"/>
      <path d="M8 11h8"/>
      <path d="M8 15h5"/>
    </svg>
  );
};