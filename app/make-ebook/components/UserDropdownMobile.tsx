"use client";
import { useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
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
import AccountAvatar from "./AccountAvatar";

export function UserDropdownMobile({
  onStartTour,
}: {
  onStartTour?: () => void;
}) {
  const { user, signOut, loading } = useAuth();
  const { tier, isGrandfathered, stripeCustomerId } = useSubscription();
  const [loggingOut, setLoggingOut] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const showUpgradeRow = tier === "free" && !isGrandfathered;
  const showBilling = tier === "pro" && !isGrandfathered && !!stripeCustomerId;

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await signOut();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-[var(--rule)] animate-pulse" />
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
            type="button"
            className="inline-flex w-10 h-10 items-center justify-center rounded-full -ml-1"
            aria-label="Account menu"
          >
            <AccountAvatar email={user.email} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          side="top"
          sideOffset={8}
          className="w-56 z-[200]"
        >
          <DropdownMenuLabel className="font-normal pt-2 pb-2">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center">
                <SubscriptionBadge />
              </div>
              <p
                className="text-125 font-medium leading-snug normal-case tracking-normal break-all text-[var(--paper)]"
                title={user.email || undefined}
              >
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {showUpgradeRow && (
            <>
              <DropdownMenuItem
                onClick={() => setUpgradeOpen(true)}
                className="font-medium"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                <span>Upgrade to Pro</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          {showBilling && (
            <>
              <div className="px-2 py-2">
                <ManageBillingButton
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                />
              </div>
              <DropdownMenuSeparator />
            </>
          )}
          {onStartTour && (
            <DropdownMenuItem onClick={onStartTour} className="cursor-pointer">
              Take the tour
            </DropdownMenuItem>
          )}
          <DropdownMenuItem asChild>
            <a href="/make-ebook/terms">Terms</a>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a href="/make-ebook/privacy">Privacy</a>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleLogout}
            disabled={loggingOut}
            className="cursor-pointer"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>{loggingOut ? "Logging out..." : "Log out"}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <UpgradeModal
        isOpen={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
      />
    </>
  );
}
