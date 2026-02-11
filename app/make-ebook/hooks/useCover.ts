import { useState, useCallback } from "react";

/**
 * Manages cover image state. Stores covers as base64 data URLs
 * so they persist in localStorage and Supabase across reloads.
 */
export function useCover(initialUrl: string | null = null) {
  const [coverUrl, setCoverUrl] = useState<string | null>(initialUrl);

  const handleCoverChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setCoverUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const clearCover = useCallback(() => {
    setCoverUrl(null);
  }, []);

  return {
    coverUrl,
    setCoverUrl,
    handleCoverChange,
    clearCover,
  };
}
