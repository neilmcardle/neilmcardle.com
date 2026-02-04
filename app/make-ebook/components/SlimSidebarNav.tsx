"use client"

import React, { useState } from 'react';
import Image from 'next/image';
import { LibraryIcon } from './icons';
import { useAuth } from '@/lib/hooks/useAuth';
import { useTheme } from '@/lib/contexts/ThemeContext';
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
          <DropdownMenuLabel className="font-normal pt-2">
            <div className="flex flex-col space-y-1">
              <p className="pt-2 pl-2 text-sm font-medium leading-none">{user?.email || 'user@email.com'}</p>
            </div>
          </DropdownMenuLabel>
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

  // Determine next theme for tooltip
  const getNextTheme = () => {
    if (theme === 'light') return 'dark';
    if (theme === 'dark') return 'paper';
    return 'light';
  };

  const renderIcon = () => {
    if (theme === 'light') {
      return <img src="/moon-icon.svg" alt="Dark mode" className="w-6 h-6" />;
    }
    if (theme === 'dark') {
      // Paper icon for dark -> paper transition
      return (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-6 h-6 text-white"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      );
    }
    // Paper mode - show sun
    return <img src="/sun-icon.svg" alt="Light mode" className="w-6 h-6" />;
  };

  return (
    <Tooltip text={`Switch to ${getNextTheme()} mode`}>
      <button
        onClick={toggleTheme}
        className="relative flex flex-col items-center justify-center w-full h-14 rounded-lg transition-colors text-[#C0C0C0] placeholder-[#C0C0C0] hover:bg-gray-50 dark:hover:bg-[#1a1a1a]"
        aria-label={`Switch to ${getNextTheme()} mode`}
      >
        {renderIcon()}
      </button>
    </Tooltip>
  );
}

export default function SlimSidebarNav({ activeView, onViewChange, libraryCount, chaptersCount, isPanelOpen, onLogoClick }: SlimSidebarNavProps) {
  
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
        {/* Theme Toggle */}
        <ThemeToggleButton />
        
        {/* User Dropdown */}
        <UserDropdownSlim />
      </div>
    </aside>
  );
}
