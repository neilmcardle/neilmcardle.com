"use client";

import { useState, useEffect, useCallback } from "react";
import {
  versionKey,
  loadVersions,
  saveVersions,
  clearVersions,
} from "../utils/versionStore";
import { Chapter } from "../types";

export interface BookVersion {
  id: string;
  timestamp: number;
  title: string;
  author: string;
  wordCount: number;
  chapterCount: number;
  chapters: Chapter[];
  metadata: {
    blurb?: string;
    publisher?: string;
    pubDate?: string;
    genre?: string;
    tags?: string[];
  };
}

interface UseVersionHistoryOptions {
  bookId: string | null | undefined;
  userId?: string;
  maxVersions?: number;
}

const STORAGE_KEY_PREFIX = "makeebook-versions-";

function countWords(html: string): number {
  if (!html) return 0;
  const text = html.replace(/<[^>]+>/g, " ");
  return text
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;
}

export function useVersionHistory({
  bookId,
  userId,
  maxVersions = 20,
}: UseVersionHistoryOptions) {
  const [versions, setVersions] = useState<BookVersion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const storageKey = bookId ? versionKey(userId, bookId) : null;

  useEffect(() => {
    if (!storageKey) {
      setVersions([]);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    loadVersions<BookVersion>(storageKey)
      .then((parsed) => {
        if (!cancelled) setVersions(parsed);
      })
      .catch((e) => {
        console.error("Failed to load version history:", e);
        if (!cancelled) setVersions([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [storageKey]);

  const saveVersion = useCallback(
    (
      title: string,
      author: string,
      chapters: Chapter[],
      metadata: BookVersion["metadata"],
    ) => {
      if (!storageKey) return null;

      const totalWords = chapters.reduce(
        (sum, ch) => sum + countWords(ch.content),
        0,
      );

      const latestVersion = versions[0];
      if (latestVersion) {
        const chaptersJson = JSON.stringify(
          chapters.map((ch) => ({
            title: ch.title,
            content: ch.content,
            type: ch.type,
          })),
        );
        const latestChaptersJson = JSON.stringify(
          latestVersion.chapters.map((ch) => ({
            title: ch.title,
            content: ch.content,
            type: ch.type,
          })),
        );
        if (
          latestVersion.title === (title || "Untitled") &&
          latestVersion.author === (author || "Unknown") &&
          chaptersJson === latestChaptersJson &&
          JSON.stringify(latestVersion.metadata) === JSON.stringify(metadata)
        ) {
          return null;
        }
      }

      const newVersion: BookVersion = {
        id: `v-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        title: title || "Untitled",
        author: author || "Unknown",
        wordCount: totalWords,
        chapterCount: chapters.length,
        chapters: JSON.parse(JSON.stringify(chapters)), // Deep clone
        metadata,
      };

      setVersions((prev) => {
        const updated = [newVersion, ...prev].slice(0, maxVersions);
        void saveVersions(storageKey, updated);
        return updated;
      });

      return newVersion;
    },
    [storageKey, maxVersions, versions],
  );

  const deleteVersion = useCallback(
    (versionId: string) => {
      if (!storageKey) return;

      setVersions((prev) => {
        const updated = prev.filter((v) => v.id !== versionId);
        void saveVersions(storageKey, updated);
        return updated;
      });
    },
    [storageKey],
  );

  const clearHistory = useCallback(() => {
    if (!storageKey) return;

    setVersions([]);
    void clearVersions(storageKey);
  }, [storageKey]);

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - timestamp;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return {
    versions,
    isLoading,
    saveVersion,
    deleteVersion,
    clearHistory,
    formatTimestamp,
    hasVersions: versions.length > 0,
  };
}
