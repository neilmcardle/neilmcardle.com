"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { BackArrowButton } from "./BackArrowButton";

interface HeaderProps {
  onNewBook?: () => void;
}

export function Header({ onNewBook }: HeaderProps = {}) {
  const pathname = usePathname();

  // Set the root page(s) where you do NOT want the back arrow to show:
  const ROOT_EDITOR_PATHS = ["/make-ebook", "/make-ebook/"];
  const showBack = !ROOT_EDITOR_PATHS.includes(pathname ?? "");

  return (
    <header className="w-full border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a1a] flex-shrink-0 h-[64px]">
  <div className="flex items-center justify-between pr-4 pl-2 h-[64px] w-full">
        {/* Left: Logo flush with left edge */}
        <div className="flex items-center gap-2 min-w-0">
          {showBack && (
            <BackArrowButton className="mr-2" label="Back" />
          )}
          <Image
            src="/make-ebook-logomark.svg"
            alt="makeEBook logo"
            width={120}
            height={120}
            className="h-[120px] w-[120px] ml-0 block lg:hidden dark:invert"
            priority
          />
          <Image
            src="/make-ebook-logomark.svg"
            alt="makeEBook logo"
            width={130}
            height={51}
            className="h-[51px] w-[130px] ml-[4px] hidden lg:block dark:invert"
            priority
          />
        </div>
        {/* Right: Reserved for future actions */}
        <div className="flex items-center gap-2 min-w-[40px]">
          {/* Theme toggle and user menu now in sidebar footer */}
        </div>
      </div>
    </header>
  );
}
