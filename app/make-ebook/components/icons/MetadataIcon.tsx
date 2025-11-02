import React from 'react';
import { ThemeAwareImage } from "@/components/ThemeAwareImage";

interface MetadataIconProps {
  className?: string;
}

export const MetadataIcon: React.FC<MetadataIconProps> = ({ 
  className = "w-5 h-5"
}) => {
  return (
    <ThemeAwareImage
      src="/metadata-icon.svg"
      alt="Book Details"
      width={20}
      height={20}
      className={className}
    />
  );
};