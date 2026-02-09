"use client"

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { LibraryIcon } from './icons';
import { useAuth } from '@/lib/hooks/useAuth';
import { useTheme } from '@/lib/contexts/ThemeContext';
import { useSubscription } from '@/lib/hooks/useSubscription';
import SubscriptionBadge from './SubscriptionBadge';
import ManageBillingButton from './ManageBillingButton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { LogOut } from 'lucide-react';

interface SlimSidebarNavProps {
  activeView: 'library' | 'book' | 'chapters' | 'preview' | null;
  onViewChange: (view: 'library' | 'book' | 'chapters' | 'preview' | null) => void;
  libraryCount: number;
  chaptersCount: number;
  isPanelOpen: boolean;
  onLogoClick?: () => void;
  onStartTour?: () => void;
  bookMindHref?: string;
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
          className="fixed left-[80px] px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-[9999] -translate-y-1/2 group-hover:-translate-y-[calc(50%+10px)] transition-transform"
          style={{ top: `${position.top}px` }}
        >
          {text}
          <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900 dark:border-r-gray-700" />
        </div>
      )}
    </div>
  );
}

// User Dropdown Component
function UserDropdownSlim() {
  const { user, signOut, loading } = useAuth();
  const { tier, isGrandfathered, stripeCustomerId } = useSubscription();
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

  // Show billing button only for Pro users with Stripe customer ID (non-grandfathered)
  const showBillingButton = tier === 'pro' && !isGrandfathered && stripeCustomerId;

  if (loading) {
    return (
      <Tooltip text="Loading...">
        <div className="relative flex flex-col items-center justify-center w-full h-14 rounded-lg bg-gray-50 dark:bg-[#1a1a1a] animate-pulse" />
      </Tooltip>
    );
  }

  if (!user) {
    return (
      <Tooltip text="Sign In">
        <button 
          className="relative flex flex-col items-center justify-center w-full h-14 rounded-lg transition-colors text-[#C0C0C0] placeholder-[#C0C0C0] hover:bg-gray-50 dark:hover:bg-[#1a1a1a]" 
          aria-label="User menu"
        >
          <img
            src="/user-icon.svg"
            alt="user icon"
            className="w-6 h-6 dark:invert"
          />
        </button>
      </Tooltip>
    );
  }

  return (
    <Tooltip text={user.email || 'User'}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button 
            className="relative flex flex-col items-center justify-center w-full h-14 rounded-lg transition-colors text-[#C0C0C0] placeholder-[#C0C0C0] hover:bg-gray-50 dark:hover:bg-[#1a1a1a]" 
            aria-label="User menu"
          >
            <img
              src="/user-icon.svg"
              alt="user icon"
              className="w-6 h-6 dark:invert"
            />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" sideOffset={8} forceMount>
          <DropdownMenuLabel className="font-normal pt-2 pb-2">
            <div className="flex flex-col space-y-3">
              <p className="pl-2 text-sm font-medium leading-none">{user?.email || 'user@email.com'}</p>
              <div className="pl-2 flex items-center">
                <SubscriptionBadge showUpgradeButton={true} />
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {showBillingButton && (
            <>
              <div className="px-2 py-1.5">
                <ManageBillingButton variant="ghost" size="sm" className="w-full justify-start" />
              </div>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem onClick={handleLogout} disabled={loggingOut} className="pr-2">
            <LogOut className="mr-2 h-4 w-4" />
            <span>{loggingOut ? "Logging out..." : "Log out"}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
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
        className="relative flex flex-col items-center justify-center w-full h-14 rounded-lg transition-colors text-[#C0C0C0] placeholder-[#C0C0C0] hover:bg-gray-50 dark:hover:bg-[#1a1a1a]"
        aria-label={`Switch to ${nextTheme} mode`}
      >
        {theme === 'light'
          ? <img src="/moon-icon.svg" alt="Dark mode" className="w-6 h-6" />
          : <img src="/sun-icon.svg" alt="Light mode" className="w-6 h-6 dark:invert" />
        }
      </button>
    </Tooltip>
  );
}

export default function SlimSidebarNav({ activeView, onViewChange, libraryCount, chaptersCount, isPanelOpen, onLogoClick, onStartTour, bookMindHref }: SlimSidebarNavProps) {
  
  const handleViewClick = (view: 'library' | 'book' | 'chapters' | 'preview') => {
    // If clicking the same view and panel is open, close it
    if (activeView === view && isPanelOpen) {
      onViewChange(null);
    } else {
      // Otherwise, open panel with this view
      onViewChange(view);
    }
  };

  return (
  <aside className="hidden lg:flex flex-col w-16 bg-white dark:bg-[#0a0a0a] h-screen items-center relative overflow-x-hidden z-50">
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
      <nav className="flex-1 flex flex-col gap-2 w-full px-2 overflow-y-auto overflow-x-hidden">
        {/* Library */}
        <Tooltip text="Library">
          <button
            onClick={() => handleViewClick('library')}
            className={`relative flex flex-col items-center justify-center w-full h-14 rounded-lg transition-colors ${
              activeView === 'library' && isPanelOpen
                ? 'bg-gray-100 dark:bg-[#1a1a1a] text-gray-900 dark:text-white'
                : 'text-[#C0C0C0] hover:bg-gray-50 dark:hover:bg-[#1a1a1a]'
            }`}
            aria-label="Library"
          >
            <LibraryIcon className="w-6 h-6 dark:[&_path]:stroke-white" />
            {libraryCount > 0 && (
              <span className="text-[10px] font-medium mt-0.5 text-gray-600 dark:text-gray-400">
                ({libraryCount})
              </span>
            )}
          </button>
        </Tooltip>

        {/* Book Details */}
        <Tooltip text="Book">
          <button
            data-tour="book-details"
            onClick={() => handleViewClick('book')}
            className={`relative flex flex-col items-center justify-center w-full h-14 rounded-lg transition-colors ${
              activeView === 'book' && isPanelOpen
                ? 'bg-gray-100 dark:bg-[#1a1a1a] text-gray-900 dark:text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1a1a1a]'
            }`}
            aria-label="Book"
          >
            <img src="/preview-icon.svg" alt="Book" className="w-6 h-6 dark:invert" />
          </button>
        </Tooltip>

        {/* Chapters */}
        <Tooltip text="Chapters">
          <button
            data-tour="chapters"
            onClick={() => handleViewClick('chapters')}
            className={`relative flex flex-col items-center justify-center w-full h-14 rounded-lg transition-colors ${
              activeView === 'chapters' && isPanelOpen
                ? 'bg-gray-100 dark:bg-[#1a1a1a] text-gray-900 dark:text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1a1a1a]'
            }`}
            aria-label="Chapters"
          >
            <img src="/chapters-icon.svg" alt="Chapters" className="w-6 h-6 dark:invert" />
            {chaptersCount > 0 && (
              <span className="text-[10px] font-medium mt-0.5 text-gray-600 dark:text-gray-400">
                ({chaptersCount})
              </span>
            )}
          </button>
        </Tooltip>

        {/* Preview */}
        <Tooltip text="Preview">
          <button
            onClick={() => handleViewClick('preview')}
            className={`relative flex flex-col items-center justify-center w-full h-14 rounded-lg transition-colors ${
              activeView === 'preview' && isPanelOpen
                ? 'bg-gray-100 dark:bg-[#1a1a1a] text-gray-900 dark:text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1a1a1a]'
            }`}
            aria-label="Preview"
          >
            <img src="/summary-icon.svg" alt="Preview" className="w-6 h-6 dark:invert" />
          </button>
        </Tooltip>

        {/* Coverly Button */}
      </nav>

      {/* Bottom section - Theme Toggle and User */}
      <div className="flex-shrink-0 flex flex-col gap-2 w-full px-2 pb-6">
        {/* Book Mind */}
        {bookMindHref && (
          <Tooltip text="Book Mind">
            <Link
              href={bookMindHref}
              className="relative flex flex-col items-center justify-center w-full h-14 rounded-lg transition-colors hover:opacity-80"
              aria-label="Book Mind"
            >
              <div className="w-9 h-9 rounded-full bg-gray-900 dark:bg-white flex items-center justify-center">
                <svg className="w-5 h-5 text-white dark:text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </Link>
          </Tooltip>
        )}

        {/* Take the Tour */}
        {onStartTour && (
          <Tooltip text="Take the tour">
            <button
              onClick={onStartTour}
              className="relative flex flex-col items-center justify-center w-full h-14 rounded-lg transition-colors text-[#C0C0C0] hover:bg-gray-50 dark:hover:bg-[#1a1a1a]"
              aria-label="Take the tour"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </button>
          </Tooltip>
        )}

        {/* Theme Toggle */}
        <ThemeToggleButton />
        
        {/* User Dropdown */}
        <UserDropdownSlim />
      </div>
    </aside>
  );
}
