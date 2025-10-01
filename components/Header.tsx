"use client";

import Link from "next/link";
import { User as UserIcon } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "./ui/dropdown-menu";
import { BackArrowButton } from "./BackArrowButton";
import { useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";

export function Header() {
  const pathname = usePathname();
  const { signOut, user } = useAuth();

  // Set the root page(s) where you do NOT want the back arrow to show:
  const ROOT_EDITOR_PATHS = ["/make-ebook", "/make-ebook/"];
  const showBack = !ROOT_EDITOR_PATHS.includes(pathname);

  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await signOut(); // Your hook's signOut
      window.location.href = "/"; // Optional, to refresh to home
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <header className="w-full border-b border-gray-200 bg-white flex-shrink-0 h-[64px] flex items-center">
      <div className="max-w-full mx-auto flex items-center justify-between px-4 sm:px-6 py-2 gap-2 w-full">
        {/* Left: Back arrow (if not on root editor), logo, tagline, profile image */}
        <div className="flex items-center gap-2 min-w-0">
          {showBack && (
            <BackArrowButton className="mr-2" label="Back" />
          )}
          <Link href="/make-ebook/explore" className="flex items-center gap-2 min-w-0">
            <Image
              src="/caveman.svg"
              alt="makeEbook logo"
              width={28}
              height={28}
              className="w-7 h-7"
              priority
            />
            <span className="font-bold text-xl text-[#23242a] tracking-tight select-none whitespace-nowrap">
              make<span className="font-extrabold">E</span>book
            </span>
          </Link>
          {/* Avatar image followed by tagline with only 2px gap */}
          <span className="flex items-center" style={{ gap: "4px" }}>
            <span className="mx-2 text-gray-300 select-none" aria-hidden="true">|</span>
            <Image
              src="/neil-avatar.png"
              alt="Neil McArdle"
              width={22}
              height={22}
              className="rounded-full object-cover w-[22px] h-[22px] border-none p-0"
              priority
            />          
            <span className="text-xs text-gray-400 ml-0">designed by Neil McArdle</span>
          </span>
        </div>
        {/* Right: User icon */}
        <div className="flex items-center gap-2 min-w-[40px] justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="inline-flex rounded-full w-10 h-10 items-center justify-center hover:bg-gray-100 transition px-0" aria-label="User menu">
                <Image
                  src="/user-icon.svg"
                  alt="user icon"
                  width={16}
                  height={16}
                  className="w-6 h-6"
                  priority
                />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.email || 'user@email.com'}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} disabled={loggingOut}>
                <span className="mr-2"></span>
                <span>{loggingOut ? "Logging out..." : "Log out"}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
