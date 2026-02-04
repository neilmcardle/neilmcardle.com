"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { X, Brush, Eraser, RotateCcw, Sparkles } from "lucide-react";

interface InpaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalImage: string; // base64 or URL
  onInpaint: (mask: string, prompt: string) => Promise<void>;
  isProcessing: boolean;
}

export function InpaintModal({
  isOpen,
  onClose,
  originalImage,
  onInpaint,
  isProcessing,
}: InpaintModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<"brush" | "eraser">("brush");
  const [brushSize, setBrushSize] = useState(30);
  const [prompt, setPrompt] = useState("");
  const [imageLoaded, setImageLoaded] = useState(false);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Canvas dimensions (match DALL-E 2 requirements: square, 1024x1024)
  const CANVAS_SIZE = 512; // Display size
  const OUTPUT_SIZE = 1024; // Output size for API

  // Initialize canvas when modal opens
  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    if (!context) return;

    setCtx(context);
    context.lineCap = "round";
    context.lineJoin = "round";

    // Clear canvas (transparent = areas to edit)
    context.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    setHistory([]);
    setHistoryIndex(-1);
    setImageLoaded(false);
  }, [isOpen]);

  // Load the original image for reference
  useEffect(() => {
    if (!originalImage || imageLoaded) return;
    setImageLoaded(true);
  }, [originalImage, imageLoaded]);

  // Save state to history
  const saveToHistory = useCallback(() => {
    if (!ctx || !canvasRef.current) return;
    const imageData = ctx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(imageData);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [ctx, history, historyIndex]);

  // Undo
  const handleUndo = useCallback(() => {
    if (!ctx || historyIndex <= 0) return;
    const prevIndex = historyIndex - 1;
    if (prevIndex >= 0 && history[prevIndex]) {
      ctx.putImageData(history[prevIndex], 0, 0);
      setHistoryIndex(prevIndex);
    } else {
      ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      setHistoryIndex(-1);
    }
  }, [ctx, history, historyIndex]);

  // Clear all
  const handleClear = useCallback(() => {
    if (!ctx) return;
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    saveToHistory();
  }, [ctx, saveToHistory]);

  // Drawing functions
  const getCoordinates = (e: React.MouseEvent | React.TouchEvent): { x: number; y: number } | null => {
    if (!canvasRef.current) return null;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = CANVAS_SIZE / rect.width;
    const scaleY = CANVAS_SIZE / rect.height;

    if ("touches" in e) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const coords = getCoordinates(e);
    if (!coords || !ctx) return;

    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);

    // Set drawing style
    if (tool === "brush") {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = "rgba(255, 255, 255, 1)"; // White = area to edit
      ctx.fillStyle = "rgba(255, 255, 255, 1)";
    } else {
      ctx.globalCompositeOperation = "destination-out"; // Eraser
    }
    ctx.lineWidth = brushSize;

    // Draw a dot for single clicks
    ctx.beginPath();
    ctx.arc(coords.x, coords.y, brushSize / 2, 0, Math.PI * 2);
    ctx.fill();
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !ctx) return;
    const coords = getCoordinates(e);
    if (!coords) return;

    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing && ctx) {
      ctx.closePath();
      saveToHistory();
    }
    setIsDrawing(false);
  };

  // Generate mask for API
  const generateMask = (): string => {
    if (!canvasRef.current) return "";

    // Create a high-res canvas for output
    const outputCanvas = document.createElement("canvas");
    outputCanvas.width = OUTPUT_SIZE;
    outputCanvas.height = OUTPUT_SIZE;
    const outputCtx = outputCanvas.getContext("2d");
    if (!outputCtx) return "";

    // Fill with black (areas to keep)
    outputCtx.fillStyle = "black";
    outputCtx.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

    // Scale up the mask drawing
    outputCtx.drawImage(canvasRef.current, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

    // For DALL-E 2: transparent areas = edit, opaque = keep
    // We need to invert: white brush strokes become transparent
    const imageData = outputCtx.getImageData(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // If pixel is white/light (user drew here), make it transparent
      if (r > 200 && g > 200 && b > 200) {
        data[i + 3] = 0; // Transparent = area to edit
      } else {
        // Keep as black, fully opaque = area to preserve
        data[i] = 0;
        data[i + 1] = 0;
        data[i + 2] = 0;
        data[i + 3] = 255;
      }
    }

    outputCtx.putImageData(imageData, 0, 0);
    return outputCanvas.toDataURL("image/png");
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!prompt.trim()) {
      alert("Please describe what you want to add or change");
      return;
    }

    const mask = generateMask();
    if (!mask) {
      alert("Please draw on the image to mark areas you want to edit");
      return;
    }

    await onInpaint(mask, prompt);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10002] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
            Edit Image with AI
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          {/* Instructions */}
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Paint over the areas you want to change. White marks = areas AI will regenerate.
          </p>

          {/* Canvas with image overlay */}
          <div className="relative mx-auto" style={{ width: CANVAS_SIZE, maxWidth: "100%" }}>
            {/* Original image as background */}
            <img
              src={originalImage}
              alt="Original"
              className="absolute inset-0 w-full h-full object-cover rounded-lg"
              style={{ aspectRatio: "1/1" }}
            />
            
            {/* Drawing canvas overlay */}
            <canvas
              ref={canvasRef}
              width={CANVAS_SIZE}
              height={CANVAS_SIZE}
              className="relative w-full rounded-lg cursor-crosshair"
              style={{ 
                aspectRatio: "1/1",
                backgroundColor: "transparent",
              }}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />

            {/* Mask overlay indicator */}
            <div className="absolute top-2 left-2 px-2 py-1 bg-black/50 rounded text-xs text-white">
              Draw to mark edit areas
            </div>
          </div>

          {/* Tools */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTool("brush")}
                className={`p-2 rounded-lg transition-colors ${
                  tool === "brush"
                    ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
                    : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                }`}
                title="Brush"
              >
                <Brush className="w-5 h-5" />
              </button>
              <button
                onClick={() => setTool("eraser")}
                className={`p-2 rounded-lg transition-colors ${
                  tool === "eraser"
                    ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
                    : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                }`}
                title="Eraser"
              >
                <Eraser className="w-5 h-5" />
              </button>
              <button
                onClick={handleUndo}
                disabled={historyIndex < 0}
                className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 disabled:opacity-40 transition-colors"
                title="Undo"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
              <button
                onClick={handleClear}
                className="px-3 py-2 text-sm rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
              >
                Clear
              </button>
            </div>

            {/* Brush size */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-500">Size</span>
              <input
                type="range"
                min="10"
                max="80"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-24 accent-neutral-900 dark:accent-white"
              />
              <span className="text-xs text-neutral-600 dark:text-neutral-400 w-6">{brushSize}</span>
            </div>
          </div>

          {/* Prompt input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              What should appear in the marked areas?
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., 'a glowing moon', 'autumn leaves', 'remove the object'"
              rows={2}
              className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-700 rounded-lg 
                         bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white
                         focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white 
                         placeholder:text-neutral-400 resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-neutral-200 dark:border-neutral-800 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-neutral-300 dark:border-neutral-700
                       text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800
                       disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isProcessing || !prompt.trim()}
            className="px-4 py-2 text-sm font-medium rounded-lg flex items-center gap-2
                       bg-neutral-900 dark:bg-white text-white dark:text-neutral-900
                       hover:bg-neutral-800 dark:hover:bg-neutral-100
                       disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            {isProcessing ? "Editing..." : "Apply Edit"}
          </button>
        </div>
      </div>
    </div>
  );
}
