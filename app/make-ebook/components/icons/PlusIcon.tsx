import { ThemeAwareImage } from "@/components/ThemeAwareImage";
import { useTheme } from "@/lib/contexts/ThemeContext";

interface PlusIconProps {
  className?: string;
  color?: string;
}

export function PlusIcon({ className = "w-5 h-5", color }: PlusIconProps) {
  const { theme } = useTheme();
  
  return (
    <ThemeAwareImage
      key={theme}
      src="/plus-icon.svg"
      alt="Plus"
      width={20}
      height={20}
      className={className}
    />
  );
}