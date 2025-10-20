import Image from "next/image";

interface LibraryIconProps {
  className?: string;
}

export function LibraryIcon({ className = "w-5 h-5" }: LibraryIconProps) {
  return (
    <Image
      src="/library-icon.svg"
      alt="Library"
      width={20}
      height={20}
      className={className}
    />
  );
}