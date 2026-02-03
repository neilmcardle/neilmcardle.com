"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Editor, AssetRecordType, createShapeId } from "tldraw";
import { Download } from "lucide-react";

type AIProvider = "openai" | "grok";

// OpenAI Logo SVG Component
function OpenAILogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.8956zm16.5963 3.8558L13.1038 8.364l2.0201-1.1685a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" />
    </svg>
  );
}

interface DesignPanelProps {
  editor: Editor | null;
  isGenerating: boolean;
  setIsGenerating: (value: boolean) => void;
  onImageGenerated: (imageUrl: string) => void;
  onDownload: (format: "png" | "jpeg" | "svg") => Promise<void>;
}

interface ProviderStatus {
  openai: "configured" | "not configured";
  grok: "configured" | "not configured";
}

export function DesignPanel({ 
  editor, 
  isGenerating, 
  setIsGenerating, 
  onImageGenerated,
  onDownload,
}: DesignPanelProps) {
  // Text inputs - initialize from localStorage
  const [titleText, setTitleText] = useState("");
  const [subtitleText, setSubtitleText] = useState("");
  const [authorText, setAuthorText] = useState("");
  const [description, setDescription] = useState("");
  
  // AI provider
  const [provider, setProvider] = useState<AIProvider>("openai");
  const [providerStatus, setProviderStatus] = useState<ProviderStatus | null>(null);
  const [lastUsedProvider, setLastUsedProvider] = useState<string | null>(null);
  
  // Generated results
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  
  // Export
  const [isExporting, setIsExporting] = useState(false);

  // Load persisted data from localStorage on mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem("coverly-design-panel");
      if (savedData) {
        const parsed = JSON.parse(savedData);
        if (parsed.titleText) setTitleText(parsed.titleText);
        if (parsed.subtitleText) setSubtitleText(parsed.subtitleText);
        if (parsed.authorText) setAuthorText(parsed.authorText);
        if (parsed.description) setDescription(parsed.description);
        if (parsed.generatedImages) setGeneratedImages(parsed.generatedImages);
        if (parsed.lastUsedProvider) setLastUsedProvider(parsed.lastUsedProvider);
      }
    } catch (e) {
      console.error("Failed to load saved data:", e);
    }
  }, []);

  // Save to localStorage when values change
  useEffect(() => {
    try {
      localStorage.setItem("coverly-design-panel", JSON.stringify({
        titleText,
        subtitleText,
        authorText,
        description,
        generatedImages,
        lastUsedProvider,
      }));
    } catch (e) {
      console.error("Failed to save data:", e);
    }
  }, [titleText, subtitleText, authorText, description, generatedImages, lastUsedProvider]);

  // Check which providers are configured
  useEffect(() => {
    fetch("/api/generate-cover")
      .then(res => res.json())
      .then(data => {
        if (data.providers) {
          setProviderStatus(data.providers);
          // Auto-select first available provider
          if (data.providers.openai === "configured") {
            setProvider("openai");
          } else if (data.providers.grok === "configured") {
            setProvider("grok");
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleGenerate = async () => {
    if (!titleText.trim() && !description.trim()) {
      alert("Please enter a title or description");
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch("/api/generate-typography", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt: description || "professional book cover design",
          title: titleText,
          subtitle: subtitleText,
          author: authorText,
          provider,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate cover");
      }

      const data = await response.json();
      
      if (data.imageUrl) {
        setGeneratedImages(prev => [data.imageUrl, ...prev].slice(0, 6));
        onImageGenerated(data.imageUrl);
        if (data.provider) {
          setLastUsedProvider(data.provider);
        }
      }
      
      if (!data.success && data.message) {
        alert(data.message);
      }
    } catch (error) {
      console.error("Generation error:", error);
      alert("Failed to generate cover. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    setIsExporting(true);
    try {
      await onDownload("png");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="p-4 space-y-5 overflow-y-auto h-full bg-white dark:bg-neutral-950">
      {/* AI Engine Selection */}
      <div className="space-y-3">
        <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">AI Engine</span>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setProvider("openai")}
            disabled={providerStatus?.openai !== "configured"}
            className={`flex flex-col items-center gap-2 px-3 py-4 rounded-lg border-2 transition-all ${
              provider === "openai"
                ? "border-neutral-900 dark:border-white bg-neutral-100 dark:bg-neutral-800"
                : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-500"
            } ${providerStatus?.openai !== "configured" ? "opacity-40 cursor-not-allowed" : ""}`}
          >
            <OpenAILogo className="w-8 h-8 text-neutral-900 dark:text-white" />
            <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">DALL·E 3</span>
          </button>
          <button
            onClick={() => setProvider("grok")}
            disabled={providerStatus?.grok !== "configured"}
            className={`flex flex-col items-center gap-2 px-3 py-4 rounded-lg border-2 transition-all ${
              provider === "grok"
                ? "border-neutral-900 dark:border-white bg-neutral-100 dark:bg-neutral-800"
                : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-500"
            } ${providerStatus?.grok !== "configured" ? "opacity-40 cursor-not-allowed" : ""}`}
          >
            <Image src="/gk-logo.svg" alt="Grok" width={32} height={32} className="w-8 h-8" />
            <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Grok</span>
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-neutral-200 dark:border-neutral-800" />

      {/* Text Inputs */}
      <div className="space-y-3">
        <input
          type="text"
          placeholder="Book Title"
          value={titleText}
          onChange={(e) => setTitleText(e.target.value)}
          className="w-full px-3 py-2.5 text-sm font-medium border border-neutral-300 dark:border-neutral-700 rounded-lg 
                     bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white
                     focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white placeholder:text-neutral-400"
        />
        <input
          type="text"
          placeholder="Subtitle (optional)"
          value={subtitleText}
          onChange={(e) => setSubtitleText(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 rounded-lg 
                     bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white
                     focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white placeholder:text-neutral-400"
        />
        <input
          type="text"
          placeholder="Author Name (optional)"
          value={authorText}
          onChange={(e) => setAuthorText(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 rounded-lg 
                     bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white
                     focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white placeholder:text-neutral-400"
        />
        <textarea
          placeholder="Describe the artwork style (e.g., 'space landscape with planets', 'dark forest with fog'). AI generates the background, you add text in the canvas."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 rounded-lg 
                     bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white
                     focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white resize-none placeholder:text-neutral-400"
        />
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating || (!titleText.trim() && !description.trim())}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 
                   bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold 
                   rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-100
                   disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        <Image src="/coverly-logomark.svg" alt="" width={20} height={20} className="w-5 h-5 invert dark:invert-0" />
        {isGenerating ? "Generating..." : "Generate Artwork"}
      </button>

      {/* Last Used Provider */}
      {lastUsedProvider && (
        <p className="text-xs text-center text-neutral-500 dark:text-neutral-400">
          Generated with {lastUsedProvider === "openai" ? "DALL·E 3" : "Grok"}
        </p>
      )}

      {/* Generated Images */}
      {generatedImages.length > 0 && (
        <div className="space-y-3 pt-2 border-t border-neutral-200 dark:border-neutral-800">
          <h3 className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
            Generated ({generatedImages.length})
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {generatedImages.map((url, index) => (
              <button
                key={index}
                onClick={() => onImageGenerated(url)}
                className="aspect-[2/3] rounded-lg overflow-hidden border-2 border-neutral-200 
                           dark:border-neutral-700 hover:border-neutral-900 dark:hover:border-white 
                           transition-all"
              >
                <img
                  src={url}
                  alt={`Generated cover ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Divider */}
      <div className="border-t border-neutral-200 dark:border-neutral-800" />

      {/* Export Section */}
      <div className="space-y-3">
        <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Export</span>
        <button
          onClick={handleDownload}
          disabled={isExporting}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium
                     border border-neutral-300 dark:border-neutral-700 rounded-lg
                     text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800
                     disabled:opacity-50 transition-colors"
        >
          <Download className="w-4 h-4" />
          Download
        </button>
      </div>
    </div>
  );
}
