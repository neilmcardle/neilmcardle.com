import React from 'react';
import Image from "next/image";

interface MetadataIconProps {
  className?: string;
}

export const MetadataIcon: React.FC<MetadataIconProps> = ({ 
  className = "w-5 h-5"
}) => {
  return (
    <Image
      src="/metadata-icon.svg"
      alt="Book Details"
      width={20}
      height={20}
      className={className}
    />
  );
};