import Image from "next/image";

interface TrashIconProps {
  className?: string;
}

export function TrashIcon({ className = "w-5 h-5" }: TrashIconProps) {
  return (
    <Image
      src="/bin-icon.svg"
      alt="Delete"
      width={20}
      height={20}
      className={className}
    />
  );
}