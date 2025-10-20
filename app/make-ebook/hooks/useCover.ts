import { useState } from "react";

export function useCover(initialFile: File | null = null) {
  const [coverFile, setCoverFile] = useState<File | null>(initialFile);

  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.[0]) setCoverFile(e.target.files[0]);
  }

  // For previewing the cover image
  const coverUrl = coverFile instanceof File ? URL.createObjectURL(coverFile) : null;

  return {
    coverFile,
    setCoverFile,
    handleCoverChange,
    coverUrl,
  };
}