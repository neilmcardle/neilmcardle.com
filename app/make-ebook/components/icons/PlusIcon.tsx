import Image from "next/image";

interface PlusIconProps {
  className?: string;
}

export function PlusIcon({ className = "w-5 h-5" }: PlusIconProps) {
  return (
    <Image
      src="/plus-icon.svg"
      alt="Plus"
      width={20}
      height={20}
      className={className}
    />
  );
}