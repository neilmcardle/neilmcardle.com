import Image from "next/image";

interface CloseIconProps {
  className?: string;
}

export function CloseIcon({ className = "w-5 h-5" }: CloseIconProps) {
  return (
    <Image
      src="/close-sidebar-icon.svg"
      alt="Close"
      width={20}
      height={20}
      className={className}
    />
  );
}