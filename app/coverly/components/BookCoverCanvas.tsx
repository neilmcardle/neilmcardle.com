"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import Image from "next/image";
import { 
  Tldraw, 
  Editor, 
  TLComponents,
  AssetRecordType,
  createShapeId,
} from "tldraw";
import "tldraw/tldraw.css";
import { DesignPanel } from "./DesignPanel";
import { PanelLeftClose, RotateCcw } from "lucide-react";

const STORAGE_KEY = "coverly-canvas";

// Standard book cover dimensions (in pixels at 300 DPI)
export const BOOK_COVER_PRESETS = {
  "kindle-ebook": { width: 1600, height: 2560, name: "Kindle eBook", dpi: 300 },
  "paperback-5x8": { width: 1500, height: 2400, name: "Paperback 5×8", dpi: 300 },
  "paperback-6x9": { width: 1800, height: 2700, name: "Paperback 6×9", dpi: 300 },
  "hardcover": { width: 1800, height: 2700, name: "Hardcover", dpi: 300 },
  "square": { width: 2000, height: 2000, name: "Square (Audio)", dpi: 300 },
} as const;

// Your TLDraw license key for neilmcardle.com
const TLDRAW_LICENSE_KEY = process.env.NEXT_PUBLIC_TLDRAW_LICENSE_KEY || "";

export default function BookCoverCanvas() {
  const [editor, setEditor] = useState<Editor | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [coverSize, setCoverSize] = useState<keyof typeof BOOK_COVER_PRESETS>("kindle-ebook");
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleMount = useCallback((editorInstance: Editor) => {
    setEditor(editorInstance);
    
    // Only create initial frame if canvas is empty (no persisted data)
    const existingShapes = editorInstance.getCurrentPageShapes();
    if (existingShapes.length === 0) {
      const preset = BOOK_COVER_PRESETS[coverSize];
      
      // Create a frame shape to represent the book cover boundary
      const frameId = createShapeId("book-cover-frame");
      editorInstance.createShape({
        id: frameId,
        type: "frame",
        x: 100,
        y: 100,
        props: {
          w: preset.width / 4,
          h: preset.height / 4,
          name: preset.name,
        },
      });

      // Zoom to fit the frame
      editorInstance.zoomToFit();
    }
  }, [coverSize]);

  // Export the cover as an image
  const handleExportCover = useCallback(async (format: "png" | "jpeg" | "svg" = "png") => {
    if (!editor) return null;

    try {
      const shapes = editor.getCurrentPageShapes();
      if (shapes.length === 0) {
        alert("No shapes to export. Add some content to your cover first.");
        return null;
      }

      // Use the editor's built-in export methods
      const result = await editor.toImage(shapes.map(s => s.id), {
        format: format === "jpeg" ? "jpeg" : "png",
        background: true,
      });

      return result.blob;
    } catch (error) {
      console.error("Export error:", error);
      return null;
    }
  }, [editor]);

  // Download the cover
  const handleDownloadCover = useCallback(async (format: "png" | "jpeg" | "svg" = "png") => {
    const blob = await handleExportCover(format);
    if (!blob) return;

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `book-cover.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [handleExportCover]);

  // Send cover to make-ebook
  const handleSendToMakeEbook = useCallback(async () => {
    const blob = await handleExportCover("png");
    if (!blob) return;

    // Convert blob to base64 for localStorage transfer
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      
      // Store in localStorage for make-ebook to pick up
      localStorage.setItem("pendingBookCover", JSON.stringify({
        data: base64,
        timestamp: Date.now(),
        dimensions: BOOK_COVER_PRESETS[coverSize],
      }));

      // Navigate to make-ebook
      window.location.href = "/make-ebook?importCover=true";
    };
    reader.readAsDataURL(blob);
  }, [handleExportCover, coverSize]);

  // Reset canvas to default state
  const handleResetCanvas = useCallback(() => {
    if (!editor) return;
    
    // Clear all shapes
    const allShapes = editor.getCurrentPageShapes();
    if (allShapes.length > 0) {
      editor.deleteShapes(allShapes.map(s => s.id));
    }
    
    // Recreate the default frame
    const preset = BOOK_COVER_PRESETS[coverSize];
    const frameId = createShapeId("book-cover-frame");
    editor.createShape({
      id: frameId,
      type: "frame",
      x: 100,
      y: 100,
      props: {
        w: preset.width / 4,
        h: preset.height / 4,
        name: preset.name,
      },
    });
    
    // Zoom to fit
    editor.zoomToFit();
  }, [editor, coverSize]);

  // Add AI-generated image to canvas
  const handleAddAIImage = useCallback(async (imageUrl: string) => {
    if (!editor) return;

    try {
      // Create asset from URL
      const assetId = AssetRecordType.createId();
      const asset = AssetRecordType.create({
        id: assetId,
        type: "image",
        props: {
          src: imageUrl,
          w: 400,
          h: 640,
          mimeType: "image/png",
          name: "ai-generated-cover.png",
          isAnimated: false,
        },
        typeName: "asset",
      });

      editor.createAssets([asset]);
      
      // Create image shape
      const shapeId = createShapeId();
      editor.createShape({
        id: shapeId,
        type: "image",
        x: 150,
        y: 150,
        props: {
          assetId: asset.id,
          w: 400,
          h: 640,
        },
      });

      // Select the new shape
      editor.select(shapeId);
    } catch (error) {
      console.error("Error adding AI image:", error);
    }
  }, [editor]);

  // Custom UI components
  const components: TLComponents = {
    // We can customize toolbar, menus, etc. here if needed
  };

  return (
    <div className="flex h-full w-full relative">
      {/* Collapsible Side Panel - slimline when closed */}
      <div 
        className={`flex-shrink-0 border-r border-neutral-200 bg-white flex flex-col overflow-hidden transition-all duration-300 ${
          isPanelOpen ? "w-80" : "w-12"
        }`}
        style={{ zIndex: 1000 }}
      >
        {isPanelOpen ? (
          <>
            {/* Panel Header with Collapse Button */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 bg-white">
              <Image src="/coverly-logo.svg" alt="Coverly" width={100} height={24} className="h-6 w-auto" />
              <div className="flex items-center gap-1">
                <button
                  onClick={handleResetCanvas}
                  className="p-1.5 rounded-md hover:bg-neutral-100 text-neutral-500 transition-colors"
                  title="Reset canvas"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsPanelOpen(false)}
                  className="p-1.5 rounded-md hover:bg-neutral-100 text-neutral-500 transition-colors"
                  title="Collapse panel"
                >
                  <PanelLeftClose className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Single Panel Content */}
            <div className="flex-1 overflow-y-auto">
              <DesignPanel
                editor={editor}
                isGenerating={isGenerating}
                setIsGenerating={setIsGenerating}
                onImageGenerated={handleAddAIImage}
                onDownload={handleDownloadCover}
              />
            </div>
          </>
        ) : (
          /* Slimline collapsed state with expand button */
          <div className="flex flex-col items-center py-3 h-full">
            <button
              onClick={() => setIsPanelOpen(true)}
              className="p-2 rounded-md hover:bg-neutral-100 transition-colors"
              title="Open panel"
            >
              <Image src="/coverly-logomark.svg" alt="Open panel" width={20} height={20} className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* TLDraw Canvas */}
      <div ref={canvasRef} className="flex-1 h-full tldraw-container">
        <Tldraw
          licenseKey={TLDRAW_LICENSE_KEY}
          persistenceKey={STORAGE_KEY}
          onMount={handleMount}
          components={components}
          forceMobile={false}
        />
      </div>

      {/* Loading Overlay */}
      {isGenerating && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center" style={{ zIndex: 10001 }}>
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-neutral-900 mx-auto mb-4" />
            <p className="text-neutral-700">Generating cover...</p>
          </div>
        </div>
      )}
    </div>
  );
}
