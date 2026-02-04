"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Editor, AssetRecordType, createShapeId } from "tldraw";
import { Download, Wand2 } from "lucide-react";
import { InpaintModal } from "./InpaintModal";

type AIProvider = "openai" | "grok" | "gemini";

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
  gemini: "configured" | "not configured";
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

  // Inpainting (edit existing image)
  const [showInpaintModal, setShowInpaintModal] = useState(false);
  const [currentImageForEdit, setCurrentImageForEdit] = useState<string | null>(null);
  const [isInpainting, setIsInpainting] = useState(false);

  // Check if there's an existing image on canvas
  const [hasExistingImage, setHasExistingImage] = useState(false);

  // Monitor canvas for existing images
  useEffect(() => {
    if (!editor) return;
    
    const checkForImages = () => {
      const shapes = editor.getCurrentPageShapes();
      const imageShapes = shapes.filter(s => s.type === "image");
      setHasExistingImage(imageShapes.length > 0);
    };
    
    // Check initially
    checkForImages();
    
    // Subscribe to changes
    const unsubscribe = editor.store.listen(checkForImages, { source: "all" });
    return () => unsubscribe();
  }, [editor]);

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
          if (data.providers.gemini === "configured") {
            setProvider("gemini");
          } else if (data.providers.openai === "configured") {
            setProvider("openai");
          } else if (data.providers.grok === "configured") {
            setProvider("grok");
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleGenerate = async () => {
    // Check if there's content on the canvas
    let hasCanvasContent = false;
    if (editor) {
      const shapes = editor.getCurrentPageShapes();
      const drawingShapes = shapes.filter(s => s.type !== "frame");
      hasCanvasContent = drawingShapes.length > 0;
    }

    if (!titleText.trim() && !description.trim() && !hasCanvasContent) {
      alert("Please enter a title, description, or draw something on the canvas");
      return;
    }

    setIsGenerating(true);

    try {
      // Capture the canvas sketch if there are shapes
      let sketchData: string | null = null;
      if (editor) {
        const shapes = editor.getCurrentPageShapes();
        // Filter out just the frame, look for actual drawings
        const drawingShapes = shapes.filter(s => s.type !== "frame");
        if (drawingShapes.length > 0) {
          try {
            const result = await editor.toImage(drawingShapes.map(s => s.id), {
              format: "png",
              background: true,
            });
            // Convert blob to base64
            const reader = new FileReader();
            sketchData = await new Promise((resolve) => {
              reader.onloadend = () => resolve(reader.result as string);
              reader.readAsDataURL(result.blob);
            });
          } catch (e) {
            console.log("Could not capture sketch:", e);
          }
        }
      }

      const response = await fetch("/api/generate-typography", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt: description || "", // Don't default to anything - let sketch drive it
          title: titleText || "Untitled", // API requires title, provide fallback
          subtitle: subtitleText,
          author: authorText,
          provider,
          sketch: sketchData, // Include the sketch if captured
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

  // Get current image from canvas for editing
  const getCurrentCanvasImage = useCallback(async (): Promise<string | null> => {
    if (!editor) return null;
    
    const shapes = editor.getCurrentPageShapes();
    const imageShapes = shapes.filter(s => s.type === "image");
    
    if (imageShapes.length === 0) return null;
    
    // Get the most recent image (usually the generated cover)
    const imageShape = imageShapes[imageShapes.length - 1];
    
    try {
      // Export the image shape
      const result = await editor.toImage([imageShape.id], {
        format: "png",
        background: true,
      });
      
      const reader = new FileReader();
      return new Promise((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(result.blob);
      });
    } catch (e) {
      console.error("Could not capture canvas image:", e);
      return null;
    }
  }, [editor]);

  // Open the inpaint modal
  const handleOpenInpaintModal = async () => {
    const image = await getCurrentCanvasImage();
    if (image) {
      setCurrentImageForEdit(image);
      setShowInpaintModal(true);
    } else {
      alert("No image found on canvas to edit");
    }
  };

  // Handle inpainting with mask
  const handleInpaint = async (mask: string, prompt: string) => {
    if (!currentImageForEdit) return;
    
    setIsInpainting(true);
    
    try {
      const response = await fetch("/api/inpaint-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: currentImageForEdit,
          mask,
          prompt,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to edit image");
      }

      const data = await response.json();
      
      if (data.imageUrl) {
        // Add edited image to history and canvas
        setGeneratedImages(prev => [data.imageUrl, ...prev].slice(0, 6));
        onImageGenerated(data.imageUrl);
        setShowInpaintModal(false);
        setCurrentImageForEdit(null);
      }
    } catch (error) {
      console.error("Inpainting error:", error);
      alert(error instanceof Error ? error.message : "Failed to edit image. Please try again.");
    } finally {
      setIsInpainting(false);
    }
  };

  return (
    <div className="p-4 space-y-5 overflow-y-auto h-full bg-white">
      {/* AI Engine Selection */}
      <div className="space-y-3">
        <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">AI Engine</span>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setProvider("gemini")}
            disabled={providerStatus?.gemini !== "configured"}
            className={`flex flex-col items-center gap-2 px-2 py-3 rounded-lg border-2 transition-all ${
              provider === "gemini"
                ? "border-neutral-900 bg-neutral-100"
                : "border-neutral-200 hover:border-neutral-400"
            } ${providerStatus?.gemini !== "configured" ? "opacity-40 cursor-not-allowed" : ""}`}
          >
            <Image src="/gmi-logomark.svg" alt="Gemini" width={28} height={28} className="w-7 h-7" />
            <span className="text-xs font-medium text-neutral-700">Gemini</span>
          </button>
          <button
            onClick={() => setProvider("openai")}
            disabled={providerStatus?.openai !== "configured"}
            className={`flex flex-col items-center gap-2 px-2 py-3 rounded-lg border-2 transition-all ${
              provider === "openai"
                ? "border-neutral-900 bg-neutral-100"
                : "border-neutral-200 hover:border-neutral-400"
            } ${providerStatus?.openai !== "configured" ? "opacity-40 cursor-not-allowed" : ""}`}
          >
            <OpenAILogo className="w-7 h-7 text-neutral-900" />
            <span className="text-xs font-medium text-neutral-700">DALL·E</span>
          </button>
          <button
            onClick={() => setProvider("grok")}
            disabled={providerStatus?.grok !== "configured"}
            className={`flex flex-col items-center gap-2 px-2 py-3 rounded-lg border-2 transition-all ${
              provider === "grok"
                ? "border-neutral-900 bg-neutral-100"
                : "border-neutral-200 hover:border-neutral-400"
            } ${providerStatus?.grok !== "configured" ? "opacity-40 cursor-not-allowed" : ""}`}
          >
            <Image src="/gk-logo.svg" alt="Grok" width={28} height={28} className="w-7 h-7" />
            <span className="text-xs font-medium text-neutral-700">Grok</span>
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-neutral-200" />

      {/* Text Inputs */}
      <div className="space-y-3">
        <input
          type="text"
          placeholder="Book Title"
          value={titleText}
          onChange={(e) => setTitleText(e.target.value)}
          className="w-full px-3 py-2.5 text-sm font-medium border border-neutral-300 rounded-lg 
                     bg-white text-neutral-900
                     focus:outline-none focus:ring-2 focus:ring-neutral-900 placeholder:text-neutral-400"
        />
        <input
          type="text"
          placeholder="Subtitle (optional)"
          value={subtitleText}
          onChange={(e) => setSubtitleText(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg 
                     bg-white text-neutral-900
                     focus:outline-none focus:ring-2 focus:ring-neutral-900 placeholder:text-neutral-400"
        />
        <input
          type="text"
          placeholder="Author Name (optional)"
          value={authorText}
          onChange={(e) => setAuthorText(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg 
                     bg-white text-neutral-900
                     focus:outline-none focus:ring-2 focus:ring-neutral-900 placeholder:text-neutral-400"
        />
        <textarea
          placeholder="Describe the artwork style (e.g., 'space landscape with planets', 'dark forest with fog'). AI generates the background, you add text in the canvas."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg 
                     bg-white text-neutral-900
                     focus:outline-none focus:ring-2 focus:ring-neutral-900 resize-y min-h-[100px] max-h-[300px] placeholder:text-neutral-400"
        />
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 
                   bg-neutral-900 text-white font-semibold 
                   rounded-lg hover:bg-neutral-800
                   disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        <Image src="/coverly-logomark.svg" alt="" width={20} height={20} className="w-5 h-5 invert" />
        {isGenerating ? "Generating..." : "Generate Artwork"}
      </button>

      {/* Edit Image Button - appears when there's an image on canvas */}
      {hasExistingImage && (
        <button
          onClick={handleOpenInpaintModal}
          disabled={isInpainting}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 
                     bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold 
                     rounded-lg hover:from-violet-700 hover:to-fuchsia-700
                     disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <Wand2 className="w-5 h-5" />
          {isInpainting ? "Editing..." : "Edit with AI"}
        </button>
      )}

      {/* Last Used Provider */}
      {lastUsedProvider && (
        <p className="text-xs text-center text-neutral-500">
          Generated with {lastUsedProvider === "openai" ? "DALL·E 3" : lastUsedProvider === "gemini" ? "Gemini" : "Grok"}
        </p>
      )}

      {/* Divider */}
      <div className="border-t border-neutral-200" />

      {/* Export Section */}
      <div className="space-y-3">
        <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Export</span>
        <button
          onClick={handleDownload}
          disabled={isExporting}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium
                     border border-neutral-300 rounded-lg
                     text-neutral-700 hover:bg-neutral-100
                     disabled:opacity-50 transition-colors"
        >
          <Download className="w-4 h-4" />
          Download
        </button>
      </div>

      {/* Inpaint Modal */}
      <InpaintModal
        isOpen={showInpaintModal}
        onClose={() => {
          setShowInpaintModal(false);
          setCurrentImageForEdit(null);
        }}
        imageUrl={currentImageForEdit || ""}
        onInpaint={handleInpaint}
        isProcessing={isInpainting}
      />
    </div>
  );
}
