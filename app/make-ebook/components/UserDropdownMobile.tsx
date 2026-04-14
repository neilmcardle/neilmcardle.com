"use client";
import { useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { useTheme } from "@/lib/contexts/ThemeContext";
import { useSubscription } from "@/lib/hooks/useSubscription";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Sparkles } from "lucide-react";
import SubscriptionBadge from "./SubscriptionBadge";
import ManageBillingButton from "./ManageBillingButton";
import UpgradeModal from "./UpgradeModal";

export function UserDropdownMobile() {
  const { user, signOut, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { tier, isGrandfathered } = useSubscription();
  const [loggingOut, setLoggingOut] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  // Free users get a single Upgrade row in the dropdown — the only place
  // upgrade messaging should appear in the product per CLAUDE.md policy.
  const showUpgradeRow = tier === 'free' && !isGrandfathered;

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-[#2f2f2f] animate-pulse" />
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="inline-flex rounded-full w-10 h-10 items-center justify-center hover:bg-gray-100 dark:hover:bg-[#2f2f2f] transition px-0 -ml-2"
            aria-label="User menu"
          >
            <img
              src="/user-icon.svg"
              alt="user icon"
              width={24}
              height={24}
              className="dark:invert"
            />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" side="top" sideOffset={8} className="w-56 z-[200]">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">Account</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
            <div className="mt-3">
              <SubscriptionBadge />
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {showUpgradeRow && (
            <>
              <DropdownMenuItem onClick={() => setUpgradeOpen(true)} className="font-medium">
                <Sparkles className="mr-2 h-4 w-4" />
                <span>Upgrade to Pro</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          {!showUpgradeRow && (
            <>
              <div className="px-2 py-1.5">
                <ManageBillingButton variant="ghost" size="sm" className="w-full justify-start" />
              </div>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem onClick={toggleTheme}>
            {theme === 'light' ? (
              <img src="/moon-icon.svg" alt="Dark mode" className="mr-2 h-4 w-4" />
            ) : (
              <img src="/sun-icon.svg" alt="Light mode" className="mr-2 h-4 w-4 dark:invert" />
            )}
            <span>{theme === 'light' ? 'Dark mode' : 'Light mode'}</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleLogout}
            disabled={loggingOut}
            className="cursor-pointer"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>{loggingOut ? 'Logging out...' : 'Log out'}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <UpgradeModal isOpen={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
    </>
  );
}
