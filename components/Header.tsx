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
import { ThemeToggle } from "./ThemeToggle";
import { useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { PlusIcon } from "../app/make-ebook/components/icons";
import { useTheme } from "@/lib/contexts/ThemeContext";

interface HeaderProps {
  onNewBook?: () => void;
}

export function Header({ onNewBook }: HeaderProps = {}) {
  const { theme } = useTheme();
  
  // Stripe checkout handler
  const handleStripeCheckout = async () => {
    const res = await fetch('/api/create-checkout-session', { method: 'POST' });
    const { sessionId } = await res.json();
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!publishableKey) {
      alert('Stripe publishable key is missing.');
      return;
    }
    const stripe = await (await import('@stripe/stripe-js')).loadStripe(publishableKey);
    if (stripe) {
      await stripe.redirectToCheckout({ sessionId });
    }
  };
  const pathname = usePathname();
  const { signOut, user } = useAuth();

  // Set the root page(s) where you do NOT want the back arrow to show:
  const ROOT_EDITOR_PATHS = ["/make-ebook", "/make-ebook/"];
  const showBack = !ROOT_EDITOR_PATHS.includes(pathname ?? "");

  const [loggingOut, setLoggingOut] = useState(false);
  const [startedFeedback, setStartedFeedback] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await signOut(); // Your hook's signOut
      window.location.href = "/"; // Optional, to refresh to home
    } finally {
      setLoggingOut(false);
    }
  }

  function handleNewBookClick() {
    if (onNewBook) onNewBook();
    setStartedFeedback(true);
    setTimeout(() => setStartedFeedback(false), 1500);
  }

  return (
    <header className="w-full border-b border-gray-200 dark:border-gray-700 bg-[#f7f9fa] dark:bg-[#1a1a1a] flex-shrink-0 h-[64px]">
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
        {/* Right: Stripe button and user icon flush with right edge */}
        <div className="flex items-center gap-2 min-w-[40px]">
          {/* Unlock Pro button - commented out
          <div
            style={{
              borderRadius: '999px',
              padding: '2.5px',
              background: 'linear-gradient(45deg, #733F06 0%, #FEF3E7 50%, #B1916B 100%)',
              display: 'inline-block',
            }}
          >
            <button
              type="button"
              onClick={handleStripeCheckout}
              className="text-gray-900 dark:text-white px-6 py-2 font-medium text-base inline-flex items-center gap-2 transition-transform focus:outline-none"
              aria-label="Unlock Pro"
              style={{
                borderRadius: '999px',
                background: theme === 'dark' ? '#1a1a1a' : '#fff',
                border: 'none',
                boxShadow: '0 6px 8px 0 rgba(0,0,0,0.16)',
                transition: 'background 0.2s',
                display: 'inline-block',
              }}
              onMouseEnter={e => e.currentTarget.style.background = theme === 'dark' ? '#2a2a2a' : 'linear-gradient(225deg, #733F06 0%, #FEF3E7 50%, #B1916B 100%)'}
              onMouseLeave={e => e.currentTarget.style.background = theme === 'dark' ? '#1a1a1a' : '#f8f8f8ff'}
            >
              Unlock Pro
            </button>
          </div>
          */}
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="inline-flex rounded-full w-10 h-10 items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition px-0" aria-label="User menu">
                <Image
                  src="/user-icon.svg"
                  alt="user icon"
                  width={16}
                  height={16}
                  className="w-6 h-6 dark:invert"
                  priority
                />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" sideOffset={8} forceMount>
              <DropdownMenuLabel className="font-normal pt-2">
                <div className="flex flex-col space-y-1">
                  <p className="pt-2 pl-2 text-sm font-medium leading-none">{user?.email || 'user@email.com'}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} disabled={loggingOut} className="pr-2">
                <span className="mr-2"></span>
                <span>{loggingOut ? "Logging out..." : "Log out"}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {/* DropdownMenu remains unchanged, just fixing closing tag position */}
        </div>
      </div>
    </header>
  );
}
