import React from 'react';

interface ChaptersIconProps {
  className?: string;
  stroke?: string;
  fill?: string;
}

export const ChaptersIcon: React.FC<ChaptersIconProps> = ({ 
  className = "w-6 h-6", 
  stroke = "#050505",
  fill = "none"
}) => {
  return (
    <svg 
      className={className}
      viewBox="0 0 21 21" 
      fill={fill} 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        d="M4.06796 10.3064C3.27444 10.5927 3.27444 11.4082 4.06796 11.6944L9.46334 13.6405C10.1103 13.8739 10.8721 13.8739 11.5191 13.6405L16.9145 11.6944C17.708 11.4082 17.708 10.5927 16.9145 10.3064" 
        stroke={stroke} 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M4.25644 13.4207C3.46292 13.7069 3.46292 14.5225 4.25644 14.8087L9.65182 16.7548C10.2988 16.9881 11.0606 16.9881 11.7076 16.7548L17.1029 14.8087C17.8965 14.5225 17.8965 13.7069 17.1029 13.4207" 
        stroke={stroke} 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M4.3542 8.65406C3.08696 8.19697 3.08715 6.89473 4.3542 6.43752L9.70648 4.50632C10.1917 4.3313 10.7634 4.3313 11.2486 4.50632L16.6009 6.43752C17.8679 6.89474 17.8681 8.19697 16.6009 8.65406L11.2486 10.5841C10.7634 10.7591 10.1917 10.7591 9.70648 10.5841L4.3542 8.65406Z" 
        stroke={stroke} 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
};