'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { WritingGoals, DayHistory } from '../hooks/useWritingGoals';

interface WritingGoalsBadgeProps extends WritingGoals {}

function FlameIcon({ className = 'w-3.5 h-3.5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2c0 0-5 5.5-5 10a5 5 0 0010 0c0-2.5-1.5-4.5-2.5-5.5 0 1.5-.5 2.5-1.5 3-.5-2-1-5-1-7.5z" />
    </svg>
  );
}

function DAY_LABELS(date: string): string {
  return new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' }).charAt(0);
}

export function WritingGoalsBadge({
  dailyTarget,
  setDailyTarget,
  currentStreak,
  longestStreak,
  todayWords,
  progressPercent,
  goalMet,
  weekHistory,
}: WritingGoalsBadgeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [goalInput, setGoalInput] = useState(String(dailyTarget));
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0 as number | undefined, bottom: undefined as number | undefined, left: 0, isMobile: false });

  useEffect(() => { setMounted(true); }, []);

  // Sync input when target changes externally
  useEffect(() => { setGoalInput(String(dailyTarget)); }, [dailyTarget]);

  const updatePosition = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const isMobile = window.innerWidth < 640;
    const dropdownWidth = isMobile ? window.innerWidth - 24 : 272;
    const dropdownHeight = 420; // approximate max height
    const left = isMobile
      ? 12
      : Math.min(rect.right - dropdownWidth, window.innerWidth - dropdownWidth - 12);
    const spaceBelow = window.innerHeight - rect.bottom;
    if (spaceBelow < dropdownHeight) {
      setPosition({ top: undefined, bottom: window.innerHeight - rect.top + 8, left, isMobile });
    } else {
      setPosition({ top: rect.bottom + 8, bottom: undefined, left, isMobile });
    }
  }, []);

  useEffect(() => {
    if (isOpen) updatePosition();
  }, [isOpen, updatePosition]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(e.target as Node)
      ) setIsOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const commitGoal = () => {
    const n = parseInt(goalInput, 10);
    if (!isNaN(n) && n > 0) setDailyTarget(n);
    else setGoalInput(String(dailyTarget));
  };

  const noGoalSet = dailyTarget === 500 && todayWords === 0 && currentStreak === 0;

  const dropdownContent = isOpen && mounted ? createPortal(
    <div
      ref={dropdownRef}
      className="fixed bg-white dark:bg-[#1e1e1e] rounded-xl shadow-2xl border border-neutral-200 dark:border-[#2f2f2f] z-[9999] overflow-hidden"
      style={{
        top: position.top,
        bottom: position.bottom,
        left: position.left,
        width: position.isMobile ? 'calc(100vw - 24px)' : '272px',
      }}
    >
      {/* Today's progress */}
      <div className="p-4 border-b border-neutral-200 dark:border-[#2f2f2f]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-[#111] dark:text-[#f5f5f5]">Today's progress</span>
          {goalMet && (
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Goal met!
            </span>
          )}
        </div>
        {/* Progress bar */}
        <div className="h-1.5 rounded-full bg-neutral-200 dark:bg-[#2f2f2f] overflow-hidden mb-2">
          <div
            className={`h-full rounded-full transition-all duration-500 ${goalMet ? 'bg-emerald-500 dark:bg-emerald-400' : 'bg-[#111] dark:bg-white'}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex justify-between items-baseline">
          <span className="text-xs text-[#444] dark:text-[#a3a3a3]">
            <span className="text-sm font-semibold text-[#111] dark:text-[#f5f5f5]">{todayWords.toLocaleString()}</span>
            {' / '}{dailyTarget.toLocaleString()} words
          </span>
          <span className="text-xs text-[#888] dark:text-[#737373]">
            {progressPercent < 100 ? `${Math.round(100 - progressPercent)}% left` : '100%'}
          </span>
        </div>
      </div>

      {/* Streak */}
      <div className="px-4 py-3 border-b border-neutral-200 dark:border-[#2f2f2f] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FlameIcon className={`w-4 h-4 ${currentStreak > 0 ? 'text-[#111] dark:text-white' : 'text-neutral-300 dark:text-[#444]'}`} />
          <div>
            <span className="text-sm font-semibold text-[#111] dark:text-[#f5f5f5]">{currentStreak}</span>
            <span className="text-xs text-[#888] dark:text-[#737373] ml-1">day streak</span>
          </div>
        </div>
        {longestStreak > 0 && (
          <span className="text-xs text-[#888] dark:text-[#737373]">Best: {longestStreak} days</span>
        )}
      </div>

      {/* Last 7 days */}
      <div className="px-4 py-3 border-b border-neutral-200 dark:border-[#2f2f2f]">
        <p className="text-xs text-[#888] dark:text-[#737373] mb-2">Last 7 days</p>
        <div className="flex gap-1.5 items-end">
          {weekHistory.map((day: DayHistory) => {
            const isToday = day.date === new Date().toISOString().split('T')[0];
            const hasWords = day.words > 0;
            return (
              <div key={day.date} className="flex flex-col items-center gap-1 flex-1">
                <div
                  title={`${day.date}: ${day.words.toLocaleString()} words`}
                  className={`w-full h-5 rounded-sm transition-colors ${
                    !hasWords
                      ? 'bg-neutral-100 dark:bg-[#262626]'
                      : day.metGoal
                      ? 'bg-[#111] dark:bg-white'
                      : 'bg-neutral-400 dark:bg-[#555]'
                  } ${isToday ? 'ring-1 ring-offset-1 ring-[#111] dark:ring-white ring-offset-white dark:ring-offset-[#1e1e1e]' : ''}`}
                />
                <span className="text-[9px] text-[#aaa] dark:text-[#555]">{DAY_LABELS(day.date)}</span>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-3 mt-2">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-sm bg-[#111] dark:bg-white" />
            <span className="text-[10px] text-[#888] dark:text-[#737373]">Goal met</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-sm bg-neutral-400 dark:bg-[#555]" />
            <span className="text-[10px] text-[#888] dark:text-[#737373]">Wrote</span>
          </div>
        </div>
      </div>

      {/* Goal setting */}
      <div className="px-4 py-3">
        <label className="text-xs text-[#888] dark:text-[#737373] block mb-1.5">Daily goal (words)</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={1}
            max={100000}
            step={50}
            value={goalInput}
            onChange={e => setGoalInput(e.target.value)}
            onBlur={commitGoal}
            onKeyDown={e => { if (e.key === 'Enter') { commitGoal(); (e.target as HTMLInputElement).blur(); } }}
            className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-neutral-200 dark:border-[#2f2f2f] bg-white dark:bg-[#262626] text-[#111] dark:text-[#f5f5f5] focus:outline-none focus:border-[#111] dark:focus:border-[#a3a3a3]"
          />
          <span className="text-xs text-[#888] dark:text-[#737373]">words/day</span>
        </div>
        <div className="flex gap-2 mt-2">
          {[250, 500, 1000, 2000].map(n => (
            <button
              key={n}
              onClick={() => { setDailyTarget(n); setGoalInput(String(n)); }}
              className={`flex-1 py-1 text-[10px] rounded-md border transition-colors ${
                dailyTarget === n
                  ? 'border-[#111] dark:border-[#a3a3a3] bg-[#111] dark:bg-[#a3a3a3] text-white dark:text-[#111] font-medium'
                  : 'border-neutral-200 dark:border-[#2f2f2f] text-[#444] dark:text-[#737373] hover:border-neutral-400 dark:hover:border-[#555]'
              }`}
            >
              {n >= 1000 ? `${n / 1000}k` : n}
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(o => !o)}
        title="Writing goals & streak"
        className="flex items-center gap-1.5 px-3 h-10 rounded-lg text-xs font-medium bg-neutral-100 dark:bg-[#262626] text-[#444] dark:text-[#d4d4d4] hover:bg-neutral-200 dark:hover:bg-[#2f2f2f] transition-colors"
      >
        <FlameIcon className={`w-4 h-4 flex-shrink-0 ${currentStreak > 0 || goalMet ? 'text-[#111] dark:text-white' : 'text-neutral-400 dark:text-[#555]'}`} />
        {currentStreak > 0 && (
          <span className="font-semibold">{currentStreak}</span>
        )}
        {/* Mini progress bar */}
        <div className="w-10 h-1 rounded-full bg-neutral-200 dark:bg-[#3a3a3a] overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${goalMet ? 'bg-emerald-500 dark:bg-emerald-400' : 'bg-[#111] dark:bg-white'}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <span>{todayWords > 0 ? `${todayWords.toLocaleString()}` : 'Goal'}</span>
      </button>
      {dropdownContent}
    </>
  );
}

export default WritingGoalsBadge;
