import Image from "next/image";

interface LockIconProps {
  className?: string;
}

export function LockIcon({ className = "w-5 h-5" }: LockIconProps) {
  return (
    <Image
      src="/padlock-locked-icon.svg"
      alt="Lock"
      width={20}
      height={20}
      className={className}
    />
  );
}