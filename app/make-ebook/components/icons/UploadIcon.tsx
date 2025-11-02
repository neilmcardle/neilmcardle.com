import { ThemeAwareImage } from "@/components/ThemeAwareImage";

interface UploadIconProps {
  className?: string;
  color?: string;
}

export function UploadIcon({ className = "w-5 h-5", color }: UploadIconProps) {
  return (
    <ThemeAwareImage
      src="/upload-icon.svg"
      alt="Upload"
      width={20}
      height={20}
      className={className}
      style={{ 
        filter: color === 'white' ? 'invert(1) brightness(2)' : undefined 
      }}
    />
  );
}