import Image from "next/image";

interface MenuIconProps {
  className?: string;
}

export function MenuIcon({ className = "w-5 h-5" }: MenuIconProps) {
  return (
    <Image
      src="/open-sidebar-icon.svg"
      alt="Menu"
      width={20}
      height={20}
      className={className}
    />
  );
}