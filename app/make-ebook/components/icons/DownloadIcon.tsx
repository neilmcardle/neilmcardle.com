import Image from "next/image";

interface DownloadIconProps {
  className?: string;
}

export function DownloadIcon({ className = "w-5 h-5" }: DownloadIconProps) {
  return (
    <Image
      src="/export-download-icon.svg"
      alt="Download"
      width={20}
      height={20}
      className={className}
    />
  );
}