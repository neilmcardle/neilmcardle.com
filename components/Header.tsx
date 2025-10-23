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
import { PlusIcon } from "../app/make-ebook/components/icons";

interface HeaderProps {
  onNewBook?: () => void;
}

export function Header({ onNewBook }: HeaderProps = {}) {
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
  const showBack = !ROOT_EDITOR_PATHS.includes(pathname);

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
    <header className="w-full border-b border-gray-200 bg-white flex-shrink-0 h-[64px]">
  <div className="flex items-center justify-between pr-4 pl-2 h-[64px] w-full">
        {/* Left: Logo flush with left edge */}
        <div className="flex items-center gap-2 min-w-0">
          {showBack && (
            <BackArrowButton className="mr-2" label="Back" />
          )}
          <Link href="/make-ebook/explore" className="flex items-center gap-2 min-w-0">
            <Image
              src="/makeEbook-full-logo.svg"
              alt="makeEBook logo"
              width={130}
              height={51}
              className="h-[51px] w-[130px]"
              priority
            />
          </Link>
        </div>
        {/* Right: Stripe button and user icon flush with right edge */}
        <div className="flex items-center gap-2 min-w-[40px]">
          <button
            onClick={handleStripeCheckout}
            className="px-4 py-2 rounded bg-[#181a1d] text-white text-sm font-semibold hover:bg-[#23252a] transition-colors"
            type="button"
          >
            Unlock Full Access
          </button>
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
