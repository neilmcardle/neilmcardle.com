import { ThemeAwareImage } from "@/components/ThemeAwareImage";

interface CalendarIconProps {
  className?: string;
}

export function CalendarIcon({ className = "w-5 h-5" }: CalendarIconProps) {
  return (
    <ThemeAwareImage
      src="/calendar-icon.svg"
      alt="Calendar"
      width={20}
      height={20}
      className={className}
    />
  );
}