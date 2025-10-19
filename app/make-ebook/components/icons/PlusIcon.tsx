import Image from "next/image";

interface PlusIconProps {
  className?: string;
  color?: string;
}

export function PlusIcon({ className = "w-5 h-5", color }: PlusIconProps) {
  return (
    <Image
      src="/plus-icon.svg"
      alt="Plus"
      width={20}
      height={20}
      className={className}
      style={{ 
        filter: color === 'white' ? 'invert(1) brightness(2)' : undefined 
      }}
    />
  );
}