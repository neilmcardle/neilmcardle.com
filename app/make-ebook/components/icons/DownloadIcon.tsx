import { ThemeAwareImage } from "@/components/ThemeAwareImage";

interface DownloadIconProps {
  className?: string;
}

export function DownloadIcon({ className = "w-5 h-5" }: DownloadIconProps) {
  return (
    <ThemeAwareImage
      src="/export-download-icon.svg"
      alt="Download"
      width={20}
      height={20}
      className={className}
    />
  );
}