import Image from "next/image";

interface DragIconProps {
  className?: string;
}

export default function DragIcon({ className = "w-4 h-4" }: DragIconProps) {
  return (
    <Image
      src="/drag-icon.svg"
      alt="Drag handle"
      width={16}
      height={16}
      className={className}
    />
  );
}