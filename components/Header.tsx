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
import { useAuth } from "@/lib/hooks/useAuth"; // Use your own auth hook!

export function Header() {
  const pathname = usePathname();
  const { signOut } = useAuth(); // Get signOut from your own hook!

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
        {/* Left: Back arrow (if not on root editor), logo */}
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
        </div>
        {/* Right: User icon */}
        <div className="flex items-center gap-2 min-w-[40px] justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="inline-flex rounded-full w-8 h-8 bg-gray-100 items-center justify-center hover:bg-gray-200 transition px-0" aria-label="User menu">
                <UserIcon className="w-5 h-5 text-gray-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">User</p>
                  <p className="text-xs leading-none text-muted-foreground">user@email.com</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled className="opacity-50">
                <span className="mr-2"><UserIcon className="h-4 w-4" /></span>
                <span>Profile</span>
                <span className="ml-auto text-xs text-gray-400">Soon</span>
              </DropdownMenuItem>
              <DropdownMenuItem disabled className="opacity-50">
                <span className="mr-2"></span>
                <span>Subscription</span>
                <span className="ml-auto text-xs text-gray-400">Soon</span>
              </DropdownMenuItem>
              <DropdownMenuItem disabled className="opacity-50">
                <span className="mr-2"></span>
                <span>Settings</span>
                <span className="ml-auto text-xs text-gray-400">Soon</span>
              </DropdownMenuItem>
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