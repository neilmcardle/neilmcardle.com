"use client"

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { LibraryIcon } from './icons';
import { useAuth } from '@/lib/hooks/useAuth';
import { useTheme } from '@/lib/contexts/ThemeContext';
import { useSubscription } from '@/lib/hooks/useSubscription';
import SubscriptionBadge from './SubscriptionBadge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { LogOut, CreditCard } from 'lucide-react';

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
function UserDropdownSlim({ onStartTour }: { onStartTour?: () => void }) {
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
        <div className="relative flex flex-col items-center justify-center w-full h-14 rounded-lg bg-gray-50 dark:bg-[#1a1a1a] animate-pulse" />
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
            className="relative flex flex-col items-center w-full py-1.5 rounded-lg group"
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
                <SubscriptionBadge showUpgradeButton={true} />
              </div>
              <p className="text-sm font-medium leading-none truncate">{user?.email || 'user@email.com'}</p>
            </div>
          </DropdownMenuLabel>
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Take the tour</span>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem asChild>
            <a href="https://neilmcardle.com/terms" target="_blank" rel="noopener noreferrer">
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Terms</span>
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a href="https://neilmcardle.com/privacy" target="_blank" rel="noopener noreferrer">
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
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
            className="relative flex flex-col items-center w-full py-1.5 rounded-lg group"
            aria-label="Library"
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center transition-opacity group-hover:opacity-60">
              <LibraryIcon className="w-5 h-5 dark:[&_path]:stroke-white" />
            </div>
            <span className={`text-[10px] font-medium -mt-2 transition-opacity group-hover:opacity-60 ${activeView === 'library' && isPanelOpen ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}`}>
              Library{libraryCount > 0 ? ` (${libraryCount})` : ''}
            </span>
          </button>
        </Tooltip>

        {/* Book Details */}
        <Tooltip text="Book">
          <button
            data-tour="book-details"
            onClick={() => handleViewClick('book')}
            className="relative flex flex-col items-center w-full py-1.5 rounded-lg group"
            aria-label="Book"
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center transition-opacity group-hover:opacity-60">
              <img src="/preview-icon.svg" alt="Book" className="w-5 h-5 dark:invert" />
            </div>
            <span className={`text-[10px] font-medium -mt-2 transition-opacity group-hover:opacity-60 ${activeView === 'book' && isPanelOpen ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}`}>
              Book
            </span>
          </button>
        </Tooltip>

        {/* Chapters */}
        <Tooltip text="Chapters">
          <button
            data-tour="chapters"
            onClick={() => handleViewClick('chapters')}
            className="relative flex flex-col items-center w-full py-1.5 rounded-lg group"
            aria-label="Chapters"
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center transition-opacity group-hover:opacity-60">
              <img src="/chapters-icon.svg" alt="Chapters" className="w-5 h-5 dark:invert" />
            </div>
            <span className={`text-[10px] font-medium -mt-2 transition-opacity group-hover:opacity-60 ${activeView === 'chapters' && isPanelOpen ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}`}>
              Chapters{chaptersCount > 0 ? ` (${chaptersCount})` : ''}
            </span>
          </button>
        </Tooltip>

        {/* Preview */}
        <Tooltip text="Preview">
          <button
            data-tour="preview"
            onClick={() => handleViewClick('preview')}
            className="relative flex flex-col items-center w-full py-1.5 rounded-lg group"
            aria-label="Preview"
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center transition-opacity group-hover:opacity-60">
              <img src="/summary-icon.svg" alt="Preview" className="w-5 h-5 dark:invert" />
            </div>
            <span className={`text-[10px] font-medium -mt-2 transition-opacity group-hover:opacity-60 ${activeView === 'preview' && isPanelOpen ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}`}>
              Preview
            </span>
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
              className="relative flex flex-col items-center w-full py-1.5 rounded-lg group"
              aria-label="Book Mind"
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center transition-opacity group-hover:opacity-60">
                <svg className="w-6 h-6 text-gray-700 dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <span className="text-[10px] font-medium -mt-2 text-gray-500 dark:text-gray-400 transition-opacity group-hover:opacity-60 text-center">Book Mind</span>
            </Link>
          </Tooltip>
        )}

        {/* Theme Toggle */}
        <ThemeToggleButton />

        {/* User Dropdown */}
        <UserDropdownSlim onStartTour={onStartTour} />
      </div>
    </aside>
  );
}
