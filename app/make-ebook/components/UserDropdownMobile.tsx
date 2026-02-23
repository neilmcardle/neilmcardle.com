"use client";
import { useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut } from "lucide-react";
import SubscriptionBadge from "./SubscriptionBadge";
import ManageBillingButton from "./ManageBillingButton";

export function UserDropdownMobile() {
  const { user, signOut, loading } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

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
      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
    );
  }

  if (!user) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="inline-flex rounded-full w-10 h-10 items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition px-0"
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
      <DropdownMenuContent align="start" className="w-56 z-[150] [&>*]:ml-2" style={{ marginLeft: '8px' }}>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">Account</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
          <div className="mt-3">
            <SubscriptionBadge showUpgradeButton={true} />
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="px-2 py-1.5">
          <ManageBillingButton variant="ghost" size="sm" className="w-full justify-start" />
        </div>
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
  );
}
