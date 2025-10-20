import Image from "next/image";

interface CalendarIconProps {
  className?: string;
}

export function CalendarIcon({ className = "w-5 h-5" }: CalendarIconProps) {
  return (
    <Image
      src="/calendar-icon.svg"
      alt="Calendar"
      width={20}
      height={20}
      className={className}
    />
  );
}