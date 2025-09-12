import React, { useRef, useLayoutEffect, useState } from "react";

export function ChapterList({
  chapters,
  selectedChapter,
  onSelect,
  onRemove,
  plainText,
}) {
  // Refs to chapter pill elements
  const pillRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [markerStyle, setMarkerStyle] = useState({ top: 0, height: 0 });

  useLayoutEffect(() => {
    // Get the DOM node of the selected pill
    const el = pillRefs.current[selectedChapter];
    if (el) {
      setMarkerStyle({
        top: el.offsetTop,
        height: el.offsetHeight,
      });
    }
  }, [selectedChapter, chapters.length]);

  return (
    <div className="relative flex flex-col gap-3 pr-1 min-h-[120px]">
      {/* The animated marker */}
      <span
        className="absolute left-[-16px] w-2 rounded-full bg-blue-600 transition-all duration-300"
        style={{
          top: markerStyle.top,
          height: markerStyle.height,
        }}
        aria-hidden="true"
      />
      {chapters.map((ch, i) => {
        const isSelected = selectedChapter === i;
        const displayTitle =
          ch.title?.trim()
            ? `Chapter ${i + 1}: ${ch.title.trim()}`
            : `Chapter ${i + 1}`;
        return (
          <div
            key={i}
            ref={el => (pillRefs.current[i] = el)}
            className={`flex items-center rounded-[30px] px-5 py-2.5 mb-2 cursor-pointer transition 
              ${isSelected ? "text-white font-semibold" : "text-white/75"}
              bg-[#181a1d] hover:bg-[#23252a] hover:text-white
              relative
            `}
            onClick={() => onSelect(i)}
            tabIndex={0}
          >
            <HandleDots />
            <span className="ml-3 text-[12px] truncate flex-1 min-w-0">{displayTitle}</span>
            <span className="ml-4 text-[11px] font-medium whitespace-nowrap">{plainText(ch.content).length} chars</span>
            <button
              className="ml-4 p-1 rounded hover:bg-white/10 text-white/65 hover:text-white transition"
              onClick={e => {
                e.stopPropagation();
                onRemove(i);
              }}
              aria-label="Delete Chapter"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor"><path d="M6 6l4 4m0-4l-4 4" /></svg>
            </button>
          </div>
        );
      })}
    </div>
  );
}

function HandleDots() {
  return (
    <span
      className="relative w-4 h-5 shrink-0 flex flex-wrap content-center gap-[2px] opacity-70 group-hover:opacity-100 transition"
      aria-hidden="true"
    >
      {Array.from({ length: 4 }).map((_, i) => (
        <span
          key={i}
          className="w-[5px] h-[5px] rounded-[2px] bg-white/55 group-hover:bg-white transition"
        />
      ))}
    </span>
  );
}