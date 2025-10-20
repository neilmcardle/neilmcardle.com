import Image from "next/image";

interface LanguagesIconProps {
  className?: string;
}

export function LanguagesIcon({ className = "w-5 h-5" }: LanguagesIconProps) {
  return (
    <Image
      src="/languages-icon.svg"
      alt="Languages"
      width={20}
      height={20}
      className={className}
    />
  );
}