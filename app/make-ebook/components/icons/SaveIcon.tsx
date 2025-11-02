import Image from "next/image";

interface SaveIconProps {
  className?: string;
}

export function SaveIcon({ className = "w-5 h-5" }: SaveIconProps) {
  return (
    <Image
      src="/save-icon.svg"
      alt="Save"
      width={20}
      height={20}
      className={`${className} dark:invert`}
    />
  );
}