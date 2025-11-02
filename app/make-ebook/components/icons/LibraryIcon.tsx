import { ThemeAwareImage } from "@/components/ThemeAwareImage";

interface LibraryIconProps {
  className?: string;
}

export function LibraryIcon({ className = "w-5 h-5" }: LibraryIconProps) {
  return (
    <ThemeAwareImage
      src="/library-icon.svg"
      alt="Library"
      width={20}
      height={20}
      className={className}
    />
  );
}