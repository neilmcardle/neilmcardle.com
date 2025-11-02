import { ThemeAwareImage } from "@/components/ThemeAwareImage";

interface UnlockIconProps {
  className?: string;
}

export function UnlockIcon({ className = "w-5 h-5" }: UnlockIconProps) {
  return (
    <ThemeAwareImage
      src="/padlock-unlocked-icon.svg"
      alt="Unlock"
      width={20}
      height={20}
      className={className}
    />
  );
}