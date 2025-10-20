"use client";
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CoverUploaderProps {
  cover: string | null;
  onUpload: (cover: string) => void;
}

export const CoverUploader: React.FC<CoverUploaderProps> = ({ cover, onUpload }) => {
  function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onUpload(reader.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <div>
      <Label htmlFor="cover">Front Cover</Label>
      <Input
        id="cover"
        type="file"
        accept="image/*"
        onChange={handleCoverUpload}
      />
      <div className="text-xs text-muted-foreground mt-1">
        <strong>Recommended:</strong> 1600 x 2560 pixels, portrait orientation, JPEG or PNG.
      </div>
      {cover && (
        <img
          src={cover}
          alt="Front Cover"
          className="mt-2 max-h-48 rounded border"
          style={{ objectFit: "contain", background: "#fff" }}
        />
      )}
    </div>
  );
};