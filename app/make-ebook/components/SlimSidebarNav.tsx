"use client"

import React, { useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/lib/hooks/useAuth';
import { useTheme } from '@/lib/contexts/ThemeContext';
import { useSubscription } from '@/lib/hooks/useSubscription';
import SubscriptionBadge from './SubscriptionBadge';
import UpgradeModal from './UpgradeModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { LogOut, CreditCard, Sparkles } from 'lucide-react';

interface SlimSidebarNavProps {
  activeView: 'library' | 'book' | 'chapters' | 'notes' | null;
  onViewChange: (view: 'library' | 'book' | 'chapters' | 'notes' | null) => void;
  libraryCount: number;
  chaptersCount: number;
  isPanelOpen: boolean;
  onLogoClick?: () => void;
  onStartTour?: () => void;
  onBookMindToggle?: () => void;
  isBookMindOpen?: boolean;
}

// Tooltip Component
function Tooltip({ children, text }: { children: React.ReactNode; text: string }) {
  const [position, setPosition] = React.useState<{ top: number } | null>(null);
  const triggerRef = React.useRef<HTMLDivElement>(null);

  const updatePosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({ top: rect.top + rect.height / 2 });
    }
  };

  const handleMouseLeave = () => {
    setPosition(null);
  };

  return (
    <div 
      ref={triggerRef}
      className="group relative"
      onMouseEnter={updatePosition}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {position && (
        <div 
          className="fixed left-[80px] px-2 py-1 bg-gray-900 dark:bg-[#2f2f2f] text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-[9999] -translate-y-1/2 group-hover:-translate-y-[calc(50%+10px)] transition-transform"
          style={{ top: `${position.top}px` }}
        >
          {text}
          <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900 dark:border-r-[#2f2f2f]" />
        </div>
      )}
    </div>
  );
}

// User Dropdown Component
function UserDropdownSlim({ onStartTour }: { onStartTour?: () => void }) {
  const { user, signOut, loading } = useAuth();
  const { tier, isGrandfathered, stripeCustomerId } = useSubscription();
  const { theme, toggleTheme } = useTheme();
  const [loggingOut, setLoggingOut] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  // Free users get a single Upgrade row in the dropdown — the only place
  // upgrade messaging should appear in the product per CLAUDE.md policy.
  // Pro and Lifetime users never see this row.
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

  const handleOpenBilling = async () => {
    try {
      const response = await fetch('/api/customer-portal', {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to open billing portal');
      const { url } = await response.json();
      if (url) window.location.href = url;
    } catch (err) {
      console.error('Portal error:', err);
    }
  };

  // Show billing button only for Pro users with Stripe customer ID (non-grandfathered)
  const showBillingButton = tier === 'pro' && !isGrandfathered && stripeCustomerId;

  if (loading) {
    return (
      <Tooltip text="Loading...">
        <div className="relative flex flex-col items-center justify-center w-full h-14 rounded-lg bg-gray-50 dark:bg-[#2f2f2f] animate-pulse" />
      </Tooltip>
    );
  }

  if (!user) {
    return (
      <Tooltip text="Sign In">
        <button
          className="relative flex flex-col items-center w-full py-1.5 rounded-lg group"
          aria-label="User menu"
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center transition-opacity group-hover:opacity-60">
            <img src="/user-icon.svg" alt="user icon" className="w-5 h-5 dark:invert" />
          </div>
        </button>
      </Tooltip>
    );
  }

  return (
    <Tooltip text={user.email || 'User'}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="relative flex flex-col items-center w-full py-1.5 rounded-lg group outline-none focus:outline-none"
            aria-label="User menu"
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center transition-opacity group-hover:opacity-60">
              <img src="/user-icon.svg" alt="user icon" className="w-5 h-5 dark:invert" />
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" sideOffset={8} forceMount>
          <DropdownMenuLabel className="font-normal pt-2 pb-2">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center">
                <SubscriptionBadge />
              </div>
              <p className="text-sm font-medium leading-none truncate">{user?.email || 'user@email.com'}</p>
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
          <DropdownMenuItem onClick={toggleTheme}>
            {theme === 'light' ? (
              <img src="/moon-icon.svg" alt="Dark mode" className="mr-2 h-4 w-4" />
            ) : (
              <img src="/sun-icon.svg" alt="Light mode" className="mr-2 h-4 w-4 dark:invert" />
            )}
            <span>{theme === 'light' ? 'Dark mode' : 'Light mode'}</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {showBillingButton && (
            <>
              <DropdownMenuItem onClick={handleOpenBilling}>
                <CreditCard className="mr-2 h-4 w-4" />
                <span>Manage Billing</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          {onStartTour && (
            <DropdownMenuItem onClick={onStartTour}>
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Take the tour</span>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem asChild>
            <a href="https://neilmcardle.com/terms" target="_blank" rel="noopener noreferrer">
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Terms</span>
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a href="https://neilmcardle.com/privacy" target="_blank" rel="noopener noreferrer">
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Privacy</span>
            </a>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} disabled={loggingOut} className="pr-2">
            <LogOut className="mr-2 h-4 w-4" />
            <span>{loggingOut ? "Logging out..." : "Log out"}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {/* Rendered at the Tooltip level so the modal survives the dropdown
          closing on click — the Upgrade row dismisses the menu, then this
          modal opens from the same click. */}
      <UpgradeModal isOpen={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
    </Tooltip>
  );
}

// Theme Toggle Button Component
function ThemeToggleButton() {
  const { theme, toggleTheme } = useTheme();

  const nextTheme = theme === 'light' ? 'dark' : 'light';

  return (
    <Tooltip text={`Switch to ${nextTheme} mode`}>
      <button
        onClick={toggleTheme}
        className="relative flex flex-col items-center w-full py-1.5 rounded-lg group"
        aria-label={`Switch to ${nextTheme} mode`}
      >
        <div className="w-10 h-10 rounded-full flex items-center justify-center transition-opacity group-hover:opacity-60">
          {theme === 'light'
            ? <img src="/moon-icon.svg" alt="Dark mode" className="w-5 h-5" />
            : <img src="/sun-icon.svg" alt="Light mode" className="w-5 h-5 dark:invert" />
          }
        </div>
      </button>
    </Tooltip>
  );
}

export default function SlimSidebarNav({ activeView, onViewChange, libraryCount, chaptersCount, isPanelOpen, onLogoClick, onStartTour, onBookMindToggle, isBookMindOpen }: SlimSidebarNavProps) {
  
  const handleViewClick = (view: 'library' | 'book' | 'chapters' | 'notes') => {
    // If clicking the same view and panel is open, close it
    if (activeView === view && isPanelOpen) {
      onViewChange(null);
    } else {
      // Otherwise, open panel with this view
      onViewChange(view);
    }
  };

  return (
  <aside className="hidden lg:flex flex-col w-16 bg-white dark:bg-[#1e1e1e] h-screen items-center relative z-50">
      {/* Logo at top */}
      <div className="flex-shrink-0 pt-6 pb-6">
        <Tooltip text="makeEBook">
          <button
            onClick={onLogoClick}
            className="hover:opacity-70 transition-opacity"
            aria-label="Go to home"
          >
            <Image
              src="/make-ebook-logo.svg"
              alt="makeEBook"
              width={40}
              height={40}
              className="w-10 h-10 dark:invert"
              priority
            />
          </button>
        </Tooltip>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 flex flex-col gap-2 w-full px-2 pt-1 overflow-y-auto">
        {/* Library */}
        <Tooltip text="Library">
          <button
            onClick={() => handleViewClick('library')}
            className="relative flex flex-col items-center w-full py-1.5 rounded-lg group outline-none focus:outline-none"
            aria-label="Library"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all group-hover:opacity-80 ${activeView === 'library' && isPanelOpen ? 'bg-[#4070ff]/12' : ''}`}>
              <svg className={`w-5 h-5 transition-colors ${activeView === 'library' && isPanelOpen ? 'text-[#4070ff]' : 'text-gray-500 dark:text-[#737373]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="4" width="3" height="16" rx="0.5" />
                <rect x="10" y="7" width="3" height="13" rx="0.5" />
                <rect x="16" y="5" width="3" height="15" rx="0.5" />
                <path d="M3 20h18" />
              </svg>
            </div>
            <span className={`text-2xs font-medium -mt-2 transition-colors group-hover:opacity-80 ${activeView === 'library' && isPanelOpen ? 'text-[#4070ff]' : 'text-gray-400 dark:text-[#525252]'}`}>
              Library{libraryCount > 0 ? ` (${libraryCount})` : ''}
            </span>
          </button>
        </Tooltip>

        {/* Book Details */}
        <Tooltip text="Book">
          <button
            data-tour="book-details"
            onClick={() => handleViewClick('book')}
            className="relative flex flex-col items-center w-full py-1.5 rounded-lg group outline-none focus:outline-none"
            aria-label="Book"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all group-hover:opacity-80 ${activeView === 'book' && isPanelOpen ? 'bg-[#4070ff]/12' : ''}`}>
              <svg className={`w-5 h-5 transition-colors ${activeView === 'book' && isPanelOpen ? 'text-[#4070ff]' : 'text-gray-500 dark:text-[#737373]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                <path d="M8 7h8M8 11h8M8 15h5" />
              </svg>
            </div>
            <span className={`text-2xs font-medium -mt-2 transition-colors group-hover:opacity-80 ${activeView === 'book' && isPanelOpen ? 'text-[#4070ff]' : 'text-gray-400 dark:text-[#525252]'}`}>
              Book
            </span>
          </button>
        </Tooltip>

        {/* Chapters */}
        <Tooltip text="Chapters">
          <button
            data-tour="chapters"
            onClick={() => handleViewClick('chapters')}
            className="relative flex flex-col items-center w-full py-1.5 rounded-lg group outline-none focus:outline-none"
            aria-label="Chapters"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all group-hover:opacity-80 ${activeView === 'chapters' && isPanelOpen ? 'bg-[#4070ff]/12' : ''}`}>
              <svg className={`w-5 h-5 transition-colors ${activeView === 'chapters' && isPanelOpen ? 'text-[#4070ff]' : 'text-gray-500 dark:text-[#737373]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6" />
                <path d="M16 13H8M16 17H8M10 9H8" />
              </svg>
            </div>
            <span className={`text-2xs font-medium -mt-2 transition-colors group-hover:opacity-80 ${activeView === 'chapters' && isPanelOpen ? 'text-[#4070ff]' : 'text-gray-400 dark:text-[#525252]'}`}>
              Chapters{chaptersCount > 0 ? ` (${chaptersCount})` : ''}
            </span>
          </button>
        </Tooltip>



        {/* Notes */}
        <Tooltip text="Notes">
          <button
            onClick={() => handleViewClick('notes')}
            className="relative flex flex-col items-center w-full py-1.5 rounded-lg group outline-none focus:outline-none"
            aria-label="Notes"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all group-hover:opacity-80 ${activeView === 'notes' && isPanelOpen ? 'bg-[#4070ff]/12' : ''}`}>
              <svg className={`w-5 h-5 transition-colors ${activeView === 'notes' && isPanelOpen ? 'text-[#4070ff]' : 'text-gray-500 dark:text-[#737373]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
              </svg>
            </div>
            <span className={`text-2xs font-medium -mt-2 transition-colors group-hover:opacity-80 ${activeView === 'notes' && isPanelOpen ? 'text-[#4070ff]' : 'text-gray-400 dark:text-[#525252]'}`}>
              Notes
            </span>
          </button>
        </Tooltip>

      </nav>

      {/* Bottom section - Theme Toggle and User */}
      <div className="flex-shrink-0 flex flex-col gap-2 w-full px-2 pb-6">
        {/* User Dropdown */}
        <UserDropdownSlim onStartTour={onStartTour} />
      </div>
    </aside>
  );
}
