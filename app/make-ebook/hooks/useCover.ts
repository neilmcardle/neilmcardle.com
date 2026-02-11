import { useState, useCallback } from "react";

const MAX_COVER_WIDTH = 1200;
const MAX_COVER_HEIGHT = 1800;
const JPEG_QUALITY = 0.8;

/**
 * Resize and compress an image file to fit within max dimensions.
 * Returns a base64 data URL (JPEG for photos, PNG preserved for transparency).
 */
function compressCoverImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;

      // Scale down if exceeds max dimensions
      if (width > MAX_COVER_WIDTH || height > MAX_COVER_HEIGHT) {
        const ratio = Math.min(MAX_COVER_WIDTH / width, MAX_COVER_HEIGHT / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);

      // Use JPEG for smaller file size (PNG only if the source is PNG with transparency)
      const isPng = file.type === "image/png";
      const dataUrl = canvas.toDataURL(isPng ? "image/png" : "image/jpeg", JPEG_QUALITY);
      resolve(dataUrl);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };

    img.src = url;
  });
}

/**
 * Manages cover image state. Stores covers as compressed base64 data URLs
 * so they persist in localStorage and Supabase across reloads.
 */
export function useCover(initialUrl: string | null = null) {
  const [coverUrl, setCoverUrl] = useState<string | null>(initialUrl);

  const handleCoverChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    compressCoverImage(file)
      .then((dataUrl) => setCoverUrl(dataUrl))
      .catch((err) => {
        console.error("Failed to compress cover image:", err);
        // Fallback to raw base64 if compression fails
        const reader = new FileReader();
        reader.onload = () => setCoverUrl(reader.result as string);
        reader.readAsDataURL(file);
      });
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
