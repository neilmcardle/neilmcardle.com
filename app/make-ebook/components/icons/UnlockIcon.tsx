import Image from "next/image";

interface UnlockIconProps {
  className?: string;
}

export function UnlockIcon({ className = "w-5 h-5" }: UnlockIconProps) {
  return (
    <Image
      src="/padlock-unlocked-icon.svg"
      alt="Unlock"
      width={20}
      height={20}
      className={className}
    />
  );
}