"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { BackArrowButton } from "./BackArrowButton";

interface HeaderProps {
  onNewBook?: () => void;
}

export function Header({ onNewBook }: HeaderProps = {}) {
  const pathname = usePathname();

  const ROOT_EDITOR_PATHS = ["/make-ebook", "/make-ebook/"];
  const showBack = !ROOT_EDITOR_PATHS.includes(pathname ?? "");

  return (
    <header className="w-full border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a1a] flex-shrink-0 h-[64px]">
      <div className="flex items-center justify-between pr-4 pl-2 h-[64px] w-full">
        <div className="flex items-center gap-2 min-w-0">
          {showBack && <BackArrowButton className="mr-2" label="Back" />}
          <Image
            src="/make-ebook/brand/mark.svg"
            alt="makeebook"
            width={82}
            height={30}
            className="h-[26px] w-auto ml-2 block lg:hidden invert dark:invert-0"
            priority
          />
          <Image
            src="/make-ebook/brand/mark.svg"
            alt="makeebook"
            width={82}
            height={30}
            className="h-[30px] w-auto ml-[4px] hidden lg:block invert dark:invert-0"
            priority
          />
        </div>
        <div className="flex items-center gap-2 min-w-[40px]" />
      </div>
    </header>
  );
}
