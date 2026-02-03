"use client";

import React from "react";
import { Editor, createShapeId } from "tldraw";
import { BOOK_COVER_PRESETS } from "./BookCoverCanvas";
import { Layout, Type, Image, Palette } from "lucide-react";

interface CoverTemplatePanelProps {
  editor: Editor | null;
  coverSize: keyof typeof BOOK_COVER_PRESETS;
  onCoverSizeChange: (size: keyof typeof BOOK_COVER_PRESETS) => void;
}

// Pre-made templates
const TEMPLATES = [
  {
    id: "minimal",
    name: "Minimal",
    description: "Clean, modern design with centered title",
    preview: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
  },
  {
    id: "classic",
    name: "Classic",
    description: "Traditional book cover layout",
    preview: "linear-gradient(135deg, #2d3436 0%, #636e72 100%)",
  },
  {
    id: "bold",
    name: "Bold",
    description: "Strong typography, striking colors",
    preview: "linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)",
  },
  {
    id: "elegant",
    name: "Elegant",
    description: "Sophisticated with decorative elements",
    preview: "linear-gradient(135deg, #8e44ad 0%, #9b59b6 100%)",
  },
  {
    id: "vintage",
    name: "Vintage",
    description: "Retro-inspired aesthetic",
    preview: "linear-gradient(135deg, #d4a574 0%, #c19a6b 100%)",
  },
  {
    id: "nature",
    name: "Nature",
    description: "Organic, natural color palette",
    preview: "linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)",
  },
];

// Background colors
const BACKGROUND_COLORS = [
  "#1a1a2e", "#2d3436", "#e74c3c", "#8e44ad", 
  "#27ae60", "#2980b9", "#f39c12", "#1abc9c",
  "#ffffff", "#000000", "#34495e", "#d35400",
];

// Map template colors to TLDraw colors
const TLDRAW_COLORS = {
  minimal: "black",
  classic: "grey", 
  bold: "red",
  elegant: "violet",
  vintage: "orange",
  nature: "green",
} as const;

export function CoverTemplatePanel({
  editor,
  coverSize,
  onCoverSizeChange,
}: CoverTemplatePanelProps) {
  
  const applyTemplate = (templateId: string) => {
    if (!editor) return;

    const preset = BOOK_COVER_PRESETS[coverSize];
    const scale = 0.25; // Scale down for canvas display
    const w = preset.width * scale;
    const h = preset.height * scale;
    const baseX = 100;
    const baseY = 100;

    // Clear existing shapes
    const existingShapes = editor.getCurrentPageShapes();
    if (existingShapes.length > 0) {
      editor.deleteShapes(existingShapes.map(s => s.id));
    }

    // Create frame for the cover
    const frameId = createShapeId("cover-frame");
    editor.createShape({
      id: frameId,
      type: "frame",
      x: baseX,
      y: baseY,
      props: {
        w,
        h,
        name: preset.name,
      },
    });

    const bgColor = TLDRAW_COLORS[templateId as keyof typeof TLDRAW_COLORS] || "black";

    // Add template-specific elements using geo shapes
    // Background rectangle
    editor.createShape({
      id: createShapeId(),
      type: "geo",
      x: baseX,
      y: baseY,
      props: {
        w,
        h,
        geo: "rectangle",
        fill: "solid",
        color: bgColor,
      },
    });
    
    // Title area - using a geo shape that users can add text to
    editor.createShape({
      id: createShapeId(),
      type: "geo",
      x: baseX + w * 0.1,
      y: baseY + h * 0.35,
      props: {
        w: w * 0.8,
        h: 60,
        geo: "rectangle",
        fill: "none",
        color: "white",
        dash: "dashed",
      },
    });
    
    // Author area
    editor.createShape({
      id: createShapeId(),
      type: "geo",
      x: baseX + w * 0.1,
      y: baseY + h * 0.75,
      props: {
        w: w * 0.8,
        h: 40,
        geo: "rectangle",
        fill: "none",
        color: "white",
        dash: "dashed",
      },
    });

    editor.zoomToFit();
  };

  const addNoteElement = () => {
    if (!editor) return;
    
    const shapeId = createShapeId();
    editor.createShape({
      id: shapeId,
      type: "note",
      x: 200,
      y: 200,
      props: {
        color: "yellow",
        size: "m",
      },
    });
    editor.select(shapeId);
  };

  const addShapeElement = () => {
    if (!editor) return;

    const shapeId = createShapeId();
    editor.createShape({
      id: shapeId,
      type: "geo",
      x: 150,
      y: 150,
      props: {
        w: 200,
        h: 300,
        geo: "rectangle",
        fill: "solid",
        color: "grey",
      },
    });
    editor.select(shapeId);
  };

  const createNewCover = () => {
    if (!editor) return;

    const preset = BOOK_COVER_PRESETS[coverSize];
    const scale = 0.25;
    const w = preset.width * scale;
    const h = preset.height * scale;

    // Clear existing shapes
    const existingShapes = editor.getCurrentPageShapes();
    if (existingShapes.length > 0) {
      editor.deleteShapes(existingShapes.map(s => s.id));
    }

    // Create frame for the cover
    const frameId = createShapeId("cover-frame");
    editor.createShape({
      id: frameId,
      type: "frame",
      x: 100,
      y: 100,
      props: {
        w,
        h,
        name: preset.name,
      },
    });

    editor.zoomToFit();
  };

  return (
    <div className="p-4 space-y-6">
      {/* Cover Size Selection */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Layout className="w-4 h-4" />
          Cover Size
        </h3>
        <select
          value={coverSize}
          onChange={(e) => onCoverSizeChange(e.target.value as keyof typeof BOOK_COVER_PRESETS)}
          className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg 
                     bg-white dark:bg-gray-900 text-gray-900 dark:text-white
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {Object.entries(BOOK_COVER_PRESETS).map(([key, preset]) => (
            <option key={key} value={key}>
              {preset.name} ({preset.width} × {preset.height}px)
            </option>
          ))}
        </select>
        <button
          onClick={createNewCover}
          className="w-full px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400
                     border border-blue-200 dark:border-blue-800 rounded-lg
                     hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors"
        >
          Create New Canvas
        </button>
      </div>

      {/* Quick Add Elements */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          Quick Add
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={addNoteElement}
            className="flex items-center justify-center gap-2 px-3 py-2 text-sm
                       border border-gray-200 dark:border-gray-700 rounded-lg
                       hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors
                       text-gray-700 dark:text-gray-300"
          >
            <Type className="w-4 h-4" />
            Add Note
          </button>
          <button
            onClick={addShapeElement}
            className="flex items-center justify-center gap-2 px-3 py-2 text-sm
                       border border-gray-200 dark:border-gray-700 rounded-lg
                       hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors
                       text-gray-700 dark:text-gray-300"
          >
            <Image className="w-4 h-4" />
            Add Shape
          </button>
        </div>
      </div>

      {/* Templates */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Palette className="w-4 h-4" />
          Templates
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {TEMPLATES.map((template) => (
            <button
              key={template.id}
              onClick={() => applyTemplate(template.id)}
              className="group relative aspect-[2/3] rounded-lg overflow-hidden border border-gray-200 
                         dark:border-gray-700 hover:ring-2 hover:ring-blue-500 transition-all"
            >
              <div 
                className="absolute inset-0"
                style={{ background: template.preview }}
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 
                              transition-opacity flex items-center justify-center">
                <span className="text-white text-xs font-medium">{template.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Background Colors */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          Quick Colors
        </h3>
        <div className="grid grid-cols-6 gap-2">
          {BACKGROUND_COLORS.map((color) => (
            <button
              key={color}
              className="w-8 h-8 rounded-full border-2 border-gray-200 dark:border-gray-700 
                         hover:ring-2 hover:ring-blue-500 transition-all"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Tip: Select a shape, then use the style panel to change colors
        </p>
      </div>

      {/* Tips */}
      <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
        <h4 className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1">
          💡 Tips
        </h4>
        <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
          <li>• Draw shapes and use AI to transform them</li>
          <li>• Double-click notes to edit text</li>
          <li>• Drag images from your computer</li>
          <li>• Use Ctrl/Cmd+Z to undo</li>
        </ul>
      </div>
    </div>
  );
}
